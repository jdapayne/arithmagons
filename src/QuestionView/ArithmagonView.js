import Point from "Utilities/Point";
import QuestionView from "QuestionView/QuestionView";

export default class ArithmagonView extends QuestionView {
  constructor (question,width,height,rotation) {
    super(question,width,height,rotation);

    const r = 0.35*Math.min(width,height);
    const n = this.question.n;
    
    this.O = new Point (0,0);
    this.vertices = [];
    for (let i = 0; i < n; i++) {
      const angle = i*Math.PI*2/n - Math.PI/2;
      this.vertices[i] = Point.fromPolar(r,angle);
    }

    this.sides = [];
    for (let i = 0; i < n; i++) {
      this.sides[i] = Point.mean(this.vertices[i],this.vertices[(i+1)%n]);
    }

    //this.translate(width/2-this.O.x,height/2-this.O.y);
    // Center (not just centre of shape)
    const topleft = Point.min(this.allpoints);
    const bottomright = Point.max(this.allpoints);
    const center = Point.mean(topleft,bottomright);
    this.translate(width/2-center.x,height/2-center.y); //centre

    this.labels = [];
    this.question.vertices.forEach( (v,i) => {
      const value = v.val.toLatex?
        v.val.toLatex(true):
        v.val.toString();
      this.labels.push({
        pos: this.vertices[i],
        textq: v.hidden? "" : value,
        texta: value,
        styleq: "normal vertex",
        stylea: v.hidden? "answer vertex" : "normal vertex"
      });
    });

    this.question.sides.forEach( (v,i) => {
      const value = v.val.toLatex?
        v.val.toLatex(true):
        v.val.toString();
      this.labels.push({
        pos: this.sides[i],
        textq: v.hidden? "" : value,
        texta: value,
        styleq: "normal side",
        stylea: v.hidden? "answer side" : "normal side"
      });
    });

    this.labels.push({
      pos: this.O,
      textq: this.question.opname,
      texta: this.question.opname,
      styleq: "normal",
      stylea: "normal"
    });

    this.labels.forEach( l => {
      l.text = l.textq;
      l.style = l.styleq;
    });

  }

  get allpoints() {
    return [this.O]
      .concat(this.vertices)
      .concat(this.sides);
  }

  drawIn(canvas) {
    const ctx = canvas.getContext("2d");
    const n = this.question.n;

    // clear the canvas and any html labels
    ctx.clearRect(0,0,canvas.width,canvas.height); // clear
    const htmlLabels = canvas.parentNode.getElementsByClassName("label");
    while (htmlLabels.length > 0) {
      htmlLabels[0].remove();
    }

    ctx.beginPath();
    for (let i = 0; i<n; i++) {
      const p = this.vertices[i];
      const next = this.vertices[(i+1)%n];
      ctx.moveTo(p.x,p.y);
      ctx.lineTo(next.x,next.y);
    }
    ctx.stroke();
    ctx.closePath();

    this.drawLabelsHtml(canvas);

  }
}
