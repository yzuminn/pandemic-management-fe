myMap = null;

const firebaseConfig = {
  apiKey: "AIzaSyAKWLInk3HEpmsL438LX41LXuVYROs_DYE",
  authDomain: "pandemic-management-1f2fd.firebaseapp.com",
  projectId: "pandemic-management-1f2fd",
  storageBucket: "pandemic-management-1f2fd.appspot.com",
  messagingSenderId: "60561382808",
  appId: "1:60561382808:web:f3977c82b16d6310ca5fed",
  measurementId: "G-TR2HC0H8SP",
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

window.onload = () => {
  unitApi = new UnitApi();
  myMap = new MyMap();
};

class MyMap extends Base {
  constructor() {
    super();
    this.initEvent();
    this.loadHeaderInfo();
    this.getUnitData();
  }

  initEvent() {}

  getUnitData() {
    const urlParams = new URLSearchParams(window.location.search);
    let unitCode = urlParams.get("unitCode");
    if (unitCode) {
      unitApi.getSingleUnitInfo(unitCode).then((res) => {
        this.loadChartData(unitCode, res.data.unitName);
      });
    } else {
      this.loadChartData("|", "Cả nước");
    }
  }

  loadChartData(unitCode, unitName) {
    db.collection(unitCode)
      .get()
      .then((querySnapshot) => {
        var docsData = [];
        querySnapshot.forEach((doc) => {
          docsData.push(doc.data());
        });
        return docsData;
      })
      .then((objectsArray) => {
        const resultMap = new Map();
        objectsArray.forEach((obj) => {
          const date = obj.date;
          if (resultMap.has(date)) {
            const existingObj = resultMap.get(date);
            existingObj.lastUpdateDeaths += obj.lastUpdateDeaths;
            existingObj.lastUpdateRecovereds += obj.lastUpdateRecovereds;
            existingObj.lastUpdateCases += obj.lastUpdateCases;
          } else {
            resultMap.set(date, { ...obj });
          }
        });
        const newArray = Array.from(resultMap.values());
        newArray.sort((a, b) => a.date - b.date);
        this.showChart(newArray, unitName);
      });
  }

  showChart(arr, unitName) {
    let arrNew = arr.map((e) => {
      return {
        x: new Date(e.date),
        y: e.lastUpdateCases,
      };
    });

    let arrRecovered = arr.map((e) => {
      return {
        x: new Date(e.date),
        y: e.lastUpdateRecovereds,
      };
    });

    let arrDeath = arr.map((e) => {
      return {
        x: new Date(e.date),
        y: e.lastUpdateDeaths,
      };
    });

    var options = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: "Tình hình dịch bệnh theo thời gian của " + unitName,
      },
      axisX: {
        valueFormatString: "DD MMM",
      },
      axisY: {
        title: "Số lượng",
        suffix: "",
        minimum: 0,
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "bottom",
        horizontalAlign: "left",
        dockInsidePlotArea: true,
        itemclick: toogleDataSeries,
      },
      data: [
        {
          type: "line",
          showInLegend: true,
          name: "Số ca mắc mới",
          markerType: "square",
          xValueFormatString: "DD MMM, YYYY",
          color: "#FFFF00",
          yValueFormatString: "#,##0 ca",
          dataPoints: arrNew,
        },
        {
          type: "line",
          showInLegend: true,
          name: "Số ca tử vong",
          lineDashType: "dash",
          color: "#FF0000",
          yValueFormatString: "#,##0 ca",
          dataPoints: arrDeath,
        },
        {
          type: "line",
          showInLegend: true,
          name: "Số ca hồi phục",
          markerType: "triangle",
          lineDashType: "dashDot",
          color: "#008000",
          yValueFormatString: "#,##0 ca",
          dataPoints: arrRecovered,
        },
      ],
    };
    $("#chartContainer").CanvasJSChart(options);

    function toogleDataSeries(e) {
      if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      e.chart.render();
    }
  }
}
