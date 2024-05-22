managerEpidemicSituation = null;

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

db.collection("|1|276|9997|")
  .get()
  .then((querySnapshot) => {
    var docsData = [];
    querySnapshot.forEach((doc) => {
      docsData.push(doc.data());
    });
    return docsData;
  })
  .then((res) => {
    console.log(JSON.stringify(res, null, 2));
  });

window.onload = () => {
  unitApi = new UnitApi();
  managerEpidemicSituation = new ManagerEpidemicSituation();
};

class ManagerEpidemicSituation extends Base {
  constructor() {
    super();
    this.level = 0;
    this.unitCode = "|";
    this.initEvent();
    this.loadHeaderInfo();
    this.prepareUnitPage();
    this.loadListUnit(this.unitCode);
  }

  prepareUnitPage() {
    var userUnitCode = sessionStorage.getItem("userUnitCode");
    if (userUnitCode.split("|").length == 5) {
      document.querySelector("#btnUpdateUnit").classList.remove("d-none");
      document.querySelector("#valueUnitDetail").value =
        sessionStorage.getItem("unitDetail");
    }
  }

  initEvent() {
    document.querySelector("#btnUpdateUnit").addEventListener("click", () => {
      document.querySelector(".dialog").classList.add("d-block");
    });
    document.querySelector(".close-from").addEventListener("click", () => {
      document.querySelector(".dialog").classList.remove("d-block");
    });
    document.querySelector(".search-box").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.loadListUnit(this.unitCode);
      }
    });
    document.querySelector("#btnRefresh").addEventListener("click", () => {
      document.querySelector(".search-box").value = "";
      this.index = 0;
      this.unitCode = "|";
      this.loadListUnit(this.unitCode);
    });
    document.querySelector("#btnReturn").addEventListener("click", () => {
      document.querySelector(".search-box").value = "";
      this.index = 0;
      this.setToParentUnit();
      this.loadListUnit(this.unitCode);
    });
    document
      .querySelector("#btnConfirmUpdate")
      .addEventListener("click", () => {
        let input1 = document.querySelector("#lastUpdateCases");
        let input2 = document.querySelector("#lastUpdateDeaths");
        let input3 = document.querySelector("#lastUpdateRecovereds");
        let input4 = document.querySelector("#updateDateInput");
        if (input1.value < 0) {
          showToastMessenger("danger", "Không nhận dữ liệu âm!");
          input1.focus();
        } else if (input2.value < 0) {
          showToastMessenger("danger", "Không nhận dữ liệu âm!");
          input2.focus();
        } else if (input3.value < 0) {
          showToastMessenger("danger", "Không nhận dữ liệu âm!");
          input3.focus();
        } else {
          let body = {
            lastUpdateCases: Number(input1.value),
            lastUpdateDeaths: Number(input2.value),
            lastUpdateRecovereds: Number(input3.value),
          };
          let today = new Date();
          if (input4.value) {
            today = new Date(input4.value);
          }
          today.setHours(0, 0, 0, 0);
          let number = Number(today);

          let wardCode = sessionStorage.getItem("userUnitCode");
          let arr = wardCode.split("|");
          let a = arr[1];
          let b = arr[2];
          var districtCode = `|${a}|${b}|`;
          var provinceCode = `|${a}|`;

          db.collection(wardCode).add({ ...body, date: number });
          db.collection(districtCode).add({ ...body, date: number });
          db.collection(provinceCode).add({ ...body, date: number });
          db.collection('|').add({ ...body, date: number });

          unitApi
            .update(body, wardCode)
            .then((res) => {
              console.log(res);
              showToastMessenger("success", "Cập nhật thành công!");
              this.loadListUnit(this.unitCode);
              document.querySelector(".dialog").classList.remove("d-block");
            })
            .catch((error) => {
              console.log(error);
              showToastMessenger(
                "danger",
                "Cập nhật thất bại. Vui lòng thử lại sau!"
              );
              document.querySelector(".dialog").classList.remove("d-block");
            });
        }
      });
  }

  loadListUnit(unitCode) {
    showLoader();
    var keyword = document.querySelector(".search-box").value;
    unitApi
      .getById(unitCode, this.getPage(), this.count, keyword)
      .then((res) => {
        console.log(res.data);
        this.total = res.data.length;
        loadTable(listColums.Unit, res.data, this.index + 1);
        this.reloadPagingInfo();
        this.initEventTable();
      })
      .catch((error) => {
        console.log(error);
        hideLoader();
        if (error.status == 405) {
          if (this.index == 0) {
            loadTable(listColums.Account, [], this.index + 1);
            showToastMessenger("success", "Không có bản ghi nào cả hiuhiu!");
          } else {
            showToastMessenger("danger", "Bạn đã đến trang cuối mất rồi!");
            this.index = this.index - this.count;
          }
        } else {
          showToastMessenger("danger", "Đã có lỗi, vui lòng thử lại sau!");
        }
      });
  }

  getPage() {
    return (this.index + this.count) / this.count;
  }

  tableRowOnDBClick(item, thisTr) {
    var popupBtns = [
      { text: "Đóng", enable: true },
      { text: "Xem", enable: true },
      { text: "Biểu đồ thống kê", enable: true },
    ];
    var btns = showPopupDialog(
      "Thông báo",
      "Bạn có muốn xem tình hình dịch các đơn vị con của đơn vị " +
      item.unitName +
      " không?",
      popupBtns
    );
    btns[0].addEventListener("click", () => {
      hidePopupDialog();
    });
    btns[1].addEventListener("click", () => {
      hidePopupDialog();
      if (item.type == "w") {
        showToastMessenger("danger", "Đây đã là đơn vị cấp nhỏ nhất!");
      } else {
        this.unitCode = item.unitCode;
        document.querySelector(".search-box").value = "";
        this.index = 0;
        this.loadListUnit(this.unitCode);
      }
    });
    btns[2].addEventListener("click", () => {
      window.location.href = "./chart.html?unitCode=" + item.unitCode;
    });
  }
}
