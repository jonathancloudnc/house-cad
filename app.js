

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Line {
  constructor(startIndex, endIndex) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }
}

class Drawing {
  constructor() {
    this.points = []
    this.lines = []
  }

  render(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var line of this.lines) {
      var startPoint = this.points[line.startIndex];
      var endPoint = this.points[line.endIndex];
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
    }
    ctx.stroke();
  }

  renderActive(ctx, canvas, activePoints, activeLines) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

    ctx.strokeStyle = "rgb(0,0,255)";
    ctx.beginPath();
    for (var index of activeLines) {
      var line = this.lines[index];
      var startPoint = this.points[line.startIndex];
      var endPoint = this.points[line.endIndex];
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgb(255,0,0)";
    for (var index of activePoints) {
      var point = this.points[index];
      ctx.strokeRect(point.x - 1, point.y - 1, 3, 3);
    }
  }

  // Return the closest nearby point if one exists
  nearbyPoint(x, y, max_distance) {
    var result = null;
    var current_distance = max_distance;
    for (var i = 0; i < this.points.length; ++i) {
      var point = this.points[i];
      if (point == null) {
        continue;
      }
      if (Math.hypot(point.x - x, point.y - y) < current_distance) {
        result = i;
        current_distance = Math.hypot(point.x - x, point.y - y);
      }
    }
    return result;
  }

  addPoint(x, y) {
    this.points.push(new Point(x, y));
    return this.points.length - 1;
  }

  deletePointIfUnused(pointIndex) {
    for (var line of this.lines) {
      if (line.startIndex == pointIndex || line.endIndex == pointIndex) {
        return;
      }
    }
    this.points[pointIndex] = null;
  }

  addLine(startIndex, endIndex) {
    this.lines.push(new Line(startIndex, endIndex));
    return this.lines.length - 1;
  }
}

var app = new Vue({
  el: '#app',
  data: {
    message: 'House CAD',
    activeCanvas:null,
    renderCanvas:null,
    activeCtx:null,
    renderCtx:null,
    lineStart:null,
    inputMode:"line",
    snapping: true,
    snapDistance: 8
  },
  methods: {
    mouseClick(e) {
      if (this.inputMode == "line") {
        var getPoint = function (e, drawing, snapping, snapDistance) {
          if (snapping) {
            nearbyPoint = drawing.nearbyPoint(e.offsetX, e.offsetY, snapDistance);
            if (nearbyPoint != null) {
              return nearbyPoint;
            }
          }
          return drawing.addPoint(e.offsetX, e.offsetY);
        };

        if (this.lineStart != null) {
          this.drawing.addLine(this.lineStart, getPoint(e, this.drawing, this.snapping, this.snapDistance));
          this.lineStart = null;
        } else {
          this.lineStart = getPoint(e, this.drawing, this.snapping, this.snapDistance);
        }
      }

      this.drawing.render(this.renderCtx, this.renderCanvas);
      
      var activePoints = [];
      if (this.lineStart != null) {
        activePoints.push(this.lineStart);
      }

      this.drawing.renderActive(this.activeCtx, this.activeCanvas, activePoints, []);
    },
    mouseDown(e) {
      //this.start_pos = 
    },
    mouseUp() {
      
    },
    mouseMove(e) {
      var nearby = this.drawing.nearbyPoint(e.offsetX, e.offsetY, this.snapDistance);
      var activePoints = [];
      if (nearby != null) {
        activePoints.push(nearby);
      }
      if (this.lineStart != null) {
        activePoints.push(this.lineStart);
      }
      this.drawing.renderActive(this.activeCtx, this.activeCanvas, activePoints, []);
    },
    lineMode() {
      this.inputMode = "line";
    },
    selectMode() {
      this.inputMode = "select";
      if (this.lineStart != null) {
        this.drawing.deletePointIfUnused(this.lineStart);
        this.lineStart = null;
      }
      this.drawing.renderActive(this.activeCtx, this.activeCanvas, [], []);
    }
  },
 mounted() {
  this.activeCanvas = document.getElementById("active-canvas");
  this.renderCanvas = document.getElementById("render-canvas");
  this.activeCtx = this.activeCanvas.getContext("2d");  
  this.renderCtx = this.renderCanvas.getContext("2d");  

  // Resize canvas
  this.activeCanvas.height = window.innerHeight;
  this.activeCanvas.width = window.innerWidth;

  this.renderCanvas.height = window.innerHeight;
  this.renderCanvas.width = window.innerWidth;

  this.drawing = new Drawing;
}
});
