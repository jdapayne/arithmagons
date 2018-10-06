import {randElem, randBetween, randBetweenFilter, gcd} from "Utilities/Utilities";
import Fraction from "fraction.js";

export default class Arithmagon {
  /* Members:
   * this.op:: Num -> Num .  The operator
   * this.opname :: String.  The name of the operator
   * this.vertices :: [{val: Num, hidden: Bool}]. The vertices
   * this.sides :: [{val: Num, hidden: Bool}]
   */
  constructor (options) {
    const defaults = {
      min : 0,
      max : 20,
      op  : "add",
      n : 3,
      num_diff: 1, // difficulty of operating on the numbers 
      puz_diff: 1, // difficulty of solving the puzzle
      type: "integer"
    };

    const settings = Object.assign({},defaults,options);

    this.n = settings.n;
    this.vertices = [];
    this.sides = [];
    if (settings.op === "add") {
      this.opname = "+";
      this.op = (x,y) => x.add(y);
    } else if (settings.op === "multiply") {
      this.opname = "\u00d7";
      this.op = (x,y) => x.mul(y);
    }

    // init sets up operation and vertices
    switch(settings.type) {
    case "integer": 
      this.initInteger(settings);
      break;
    case "fraction":
      this.initFraction(settings);
      break;
    default:
      throw new Error("Unexpected switch default");
    }


    for (let i = 0; i<this.n; i++) {
      this.sides[i] = {
        val: this.op(this.vertices[i].val, this.vertices[(i+1)%this.n].val),
        hidden: false
      };
    }

    // hide vertices/sides
    switch(settings.puz_diff) {
    case 1:
      this.sides.forEach( x => {x.hidden = true;} );
      break;
    case 2: {
      this.sides.forEach( x => {x.hidden = true;} );
      const showside = randBetween(0,this.n-1,Math.random);
      const hidevert = Math.random()<0.5 ?
        showside : // previous vertex
        (showside + 1)%this.n; //next vertex;

      this.sides[showside].hidden = false;
      this.vertices[hidevert].hidden = true;
      break;
    }
    case 3:
      this.vertices.forEach ( x => {x.hidden = true;} );
      break;
    default:
      throw new Error ("no_difficulty");
    }
  }

  initInteger(settings) {
    /* Not using this - for now
    const min =
      settings.op === "multiply" ? Math.max(1,settings.min) : 
      settings.num_diff < 3 ? Math.max(0,settings.min) :
      settings.min;

    const max = settings.num_diff < 2 ?
      Math.min(10,settings.max) :
      settings.max;
      */

    for (let i = 0; i<this.n; i++) {
      this.vertices[i] = {
        val: new Fraction(randBetweenFilter(
          settings.min,
          settings.max,
          x => (settings.op==="add" || x!==0)
        )),
        hidden: false
      };
    }
  }

  initFraction(settings) {
    if (settings.op==="add") {this.initFractionAdd(settings);}
    else if (settings.op==="multiply") {this.initFractionMultiply(settings);}
    else {throw new Error("Unknown operation");}
  }

  initFractionAdd(settings) {
    /*Difficulty settings:
     * 1: proper fractions with same denominator, no cancelling after DONE
     * 2: proper fractions with same denominator, no cancellling answer improper fraction
     * 3: proper fractions with one denominator a multiple of another, gives proper fraction
     * 4: proper fractions with one denominator a multiple of another, gives improper fraction
     * 5: proper fractions with different denominators (not co-prime), gives improper fraction
     * 6: mixed numbers
     * 7: mixed numbers, bigger numerators and denominators
     * 8: mixed numbers, big integer parts
     */

    // TODO - anything other than difficulty 1.
    const diff=settings.num_diff;
    if (diff<3) {
      const den = randElem([5,7,9,11,13,17]);
      for (let i = 0; i<this.n; i++) {

        const prevnum = this.vertices[i-1] ?
          this.vertices[i-1].val.n : undefined;
        const nextnum = this.vertices[(i+1)%this.n] ?
          this.vertices[(i+1)%this.n].val.n : undefined;
        
        const maxnum = 
          diff===2? den - 1:
            nextnum? den - Math.max(nextnum,prevnum):
              prevnum? den - prevnum:
                den - 1;

        const num = randBetweenFilter(1,maxnum, x => (
          // Ensures no simplifing afterwards if difficulty is 1
          gcd(x,den)===1 &&
          (!prevnum || gcd(x+prevnum,den)===1 || x+prevnum===den) &&
          (!nextnum || gcd(x+nextnum,den)===1 || x+nextnum===den)
        ));

        this.vertices[i] = {
          val: new Fraction(num,den),
          hidden: false
        };
      }
    } else {
      const denbase = randElem(
        diff<7 ? [2,3,5] : [2,3,4,5,6,7,8,9,10,11]
      );
      for (let i = 0; i<this.n; i++) {
        const prev = this.vertices[i-1] ?
          this.vertices[i-1].val : undefined;
        const next = this.vertices[(i+1)%this.n] ?
          this.vertices[(i+1)%this.n].val : undefined;

        const maxmultiplier = diff<7? 4 : 8;
        
        const multiplier =
          i%2===1 || diff>4? randBetweenFilter(2,maxmultiplier,x=>
            (!prev || x!==prev.d/denbase) &&
            (!next || x!==next.d/denbase) 
          ) : 1;

        const den = denbase*multiplier;

        let num;
        if (diff<6) {
          num = randBetweenFilter(1,den-1, x => (
            gcd(x,den)===1 &&
            (diff>=4 || !prev || prev.add(x,den)<=1) &&
            (diff>=4 || !next || next.add(x,den)<=1)
          ));
        } else if (diff<8) {
          num = randBetweenFilter(den+1,den*6,x=>gcd(x,den)===1);
        } else {
          num = randBetweenFilter(den*10,den*100,x=>gcd(x,den)===1);
        }
        
        this.vertices[i] = {
          val: new Fraction(num,den),
          hidden: false
        };
      }
    }
  }

  initFractionMultiply(settings){
    for (let i = 0; i<this.n; i++) {
      const d = randBetween(2,10);
      const n = randBetween(1,d-1);
      this.vertices[i] = {
        val: new Fraction(n,d),
        hidden: false
      };
    }
  }

}
