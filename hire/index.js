(function (win) {
  function getTextAttrs(cfg) {
    return F2.Util.mix({}, {
      fillOpacity: cfg.opacity,
      fontSize: cfg.origin._origin.size,
      rotate: (cfg.origin._origin.rotate * Math.PI) / 180,
      text: cfg.origin._origin.text,
      textAlign: 'center',
      fontFamily: cfg.origin._origin.font,
      fill: cfg.color,
      textBaseline: 'Alphabetic'
    }, cfg.style);
  }

  F2.Shape.registerShape('point', 'cloud', {
    draw(cfg, container) {
      var attrs = getTextAttrs(cfg);
      var x = cfg.x;
      var y = this._coord.y.start - cfg.y;
      return container.addShape('text', {
        attrs: F2.Util.mix(attrs, {
          x,
          y
        })
      });
    }
  });

  function Painter(data, canvasWidth, canvasHeight) {
    var dv = new DataSet.View().source(data);
    var range = dv.range('value');
    var min = range[0];
    var max = range[1];
    var MAX_FONTSIZE = 100; // 最大的字体
    var MIN_FONTSIZE = 24; // 最小的字体
    // 生成词云的布局
    dv.transform({
      type: 'tag-cloud',
      fields: ['x', 'value'],
      size: [canvasWidth, canvasHeight], // 同 canvas 画布保持一致
      font: 'Arial',
      padding: 0,
      timeInterval: 5000, // max execute time
      rotate: function rotate() {
        var random = ~~(Math.random() * 4) % 4;
        if (random == 2) {
          random = 0;
        }
        return random * 270; // 0, 90, 270
      },
      fontSize: function fontSize(d) {
        if (d.value) {
          return (d.value - min) / (max - min) * (MAX_FONTSIZE - MIN_FONTSIZE) + MIN_FONTSIZE;
        }
        return 0;
      }
    });
    var chart = new F2.Chart({
      id: 'myChart',
      padding: 0,
      pixelRatio: window.devicePixelRatio
    });
    chart.source(dv.rows, {
      x: {
        nice: false
      },
      y: {
        nice: false
      }
    });
    chart.legend(false);
    chart.axis(false);
    chart.tooltip(false);

    chart.point().position('x*y').color('category').shape('cloud');

    this.chart = chart;
    return this.chart;
  }

  Painter.prototype = {
    constructor: 'F2Painter',
    repaint: function () {
      this.chart.repaint();
    },
    clear: function () {
      this.chart.clear();
    }
  }
  win.Painter = Painter;
})(window);

(function (win) {
  function Slider(conf) {
    this.container = conf.container;
    this.items = conf.items;
    this.currentClass = conf.currentClass || 'current';
    this.index = conf.index || 0;
    this.container.addEventListener('touchstart', this._start.bind(this));
    this.container.addEventListener('touchmove', this._move.bind(this));
    this.container.addEventListener('touchend', this._end.bind(this));
    // Safari 10 的 一个bug：https://bugs.webkit.org/show_bug.cgi?id=163207
    this.container.addEventListener('touchforcechange', this._forcechange.bind(this));
    this.onChange = conf.onChange;
    this.moveTo(0);
    return this;
  }

  Slider.prototype = {
    constructor: 'Slider',
    _forcechange: function (e) {
      e.preventDefault();
      e.stopPropagation();
    },

    _start: function (e) {
      this.startPos = e.touches[0].clientY;

      e.preventDefault();
      e.stopPropagation();
    },

    _move: function (e) {
      e.preventDefault();
      e.stopPropagation();
    },

    _end: function (e) {
      var distance = e.changedTouches[0].clientY - this.startPos;

      if (distance > 30) {
        this.prev();
      }

      if (distance < -30) {
        this.next();
      }

      e.preventDefault();
      e.stopPropagation();
    },

    _activeIndex: function (index) {
      var currentClass = this.currentClass;
      var self = this;
      this.items.forEach(function (item, i) {
        if (i === index) {
          self.index = index;
          item.classList.add(currentClass);
        } else if (item.classList.contains(currentClass)) {
          item.classList.remove(currentClass)
        }
      });
      if (typeof this.onChange === 'function') {
        this.onChange(this.items[index], index);
      }

    },
    moveTo: function (index, direct) {
      var self = this;

      index = parseInt(index);

      if (index >= this.items.length || index < 0) {
        return;
      }

      this.container.style.transform = "translate(0, " + (-index * 100) + "%)";
      self._activeIndex(index);
    },

    prev: function () {
      this.moveTo(this.index - 1);
    },

    next: function () {
      this.moveTo(this.index + 1);
    },
  }

  win.Slider = Slider;


})(window)

var welfareData = [
  {
    "x": "股票期权",
    "value": 10000,
    "category": "money"
  },
  {
    "x": "社会保险",
    "value": 14,
    "category": "money"
  },
  {
    "x": "商业保险",
    "value": 7000,
    "category": "money"
  },
  {
    "x": "住房公积金",
    "value": 14,
    "category": "money"
  },
  {
    "x": "蒲公英计划",
    "value": 14,
    "category": "money"
  },
  {
    "x": "彩虹计划",
    "value": 14,
    "category": "money"
  },
  {
    "x": "iHome 置业贷款",
    "value": 6000,
    "category": "money"
  },
  {
    "x": "小额贷款",
    "value": 7000,
    "category": "money"
  },
  {
    "x": "年终奖",
    "value": 10000,
    "category": "money"
  },
  {
    "x": "集体婚礼",
    "value": 4000,
    "category": "life"
  },
  {
    "x": "阿里日",
    "value": 14,
    "category": "life"
  },
  {
    "x": "年陈",
    "value": 14,
    "category": "life"
  },
  {
    "x": "年休假",
    "value": 14,
    "category": "life"
  },
  {
    "x": "特色路途假",
    "value": 4000,
    "category": "life"
  },
  {
    "x": "团队建设",
    "value": 14,
    "category": "life"
  },
  {
    "x": "Outing",
    "value": 14,
    "category": "life"
  },
  {
    "x": "孕妇休息室",
    "value": 14,
    "category": "life"
  },
  {
    "x": "员工餐饮",
    "value": 14,
    "category": "life"
  },
  {
    "x": "幸福大巴",
    "value": 14,
    "category": "life"
  },
  {
    "x": "健身房",
    "value": 3000,
    "category": "life"
  },
  {
    "x": "iBaby 子女教育",
    "value": 6000,
    "category": "life"
  },
  {
    "x": "孕妇休息室",
    "value": 14,
    "category": "life"
  },
  {
    "x": "中秋礼包",
    "value": 4000,
    "category": "life"
  }, {
    "x": "带薪假期",
    "value": 14,
    "category": "life"
  },
  {
    "x": "年度体检",
    "value": 1000,
    "category": "health"
  },
  {
    "x": "身心健康热线",
    "value": 14,
    "category": "health"
  }, {
    "x": "孕妇关怀短信",
    "value": 14,
    "category": "health"
  }, {
    "x": "健康大讲堂&沙龙",
    "value": 14,
    "category": "health"
  },
  {
    "x": "补充医疗保险",
    "value": 2000,
    "category": "health"
  },
  {
    "x": "补充生育保险",
    "value": 14,
    "category": "health"
  },
  {
    "x": "重疾就医协助",
    "value": 3000,
    "category": "health"
  },
  {
    "x": "健康服务中心",
    "value": 14,
    "category": "health"
  },
  {
    "x": "全球救援",
    "value": 14,
    "category": "health"
  },
  {
    "x": "父母体检计划",
    "value": 5000,
    "category": "health"
  },
];
var painter = null;

// https://stackoverflow.com/questions/40027513/scroll-cant-be-default-prevented-on-touchmove-event-on-ios10
window.addEventListener('touchmove', function () { })

new Slider({
  container: document.getElementById('root'),
  items: document.querySelectorAll('#root .section'),
  onChange: function (dom) {
    if (dom.classList.contains('section-chart')) {
      var width = document.documentElement.clientWidth * 0.8;
      var height = document.documentElement.clientHeight * 0.8;
      var myChart = document.getElementById('myChart');
      myChart.width = width;
      myChart.height = height;

      painter = new Painter(welfareData, width, height);

      painter.repaint();
    } else {
      if (painter) {
        painter.clear();
      }
    }
  }
})