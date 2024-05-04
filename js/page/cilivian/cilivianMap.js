myMap = null;

window.onload = () => {
    unitApi = new UnitApi();
    myMap = new MyMap();
}

class MyMap extends Base {
    constructor() {
        super();
        this.data = [];
        this.map = L.map('map').setView([15.729824, 100.6133113], 6);
        L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(this.map);
        this.initEvent();
        this.loadHeaderInfo();
        this.loadListProvince();
    }

    initEvent() {

    }

    loadListProvince() {
        showLoader();
        unitApi.getById("|", 1, 100, "").then(res => {
            this.data = res.data;
            L.geoJSON(geojson,
                {
                    style: (feature) => {
                        let provinceInfo = this.getProvinceInfo(feature.properties.ISO3166_2_CODE);
                        let color = "";
                        if (provinceInfo.warningLevel == 0) {
                            color = "green";
                        } else if (provinceInfo.warningLevel == 1) {
                            color = "yellow";
                        } else if (provinceInfo.warningLevel == 2) {
                            color = "orange";
                        } else if (provinceInfo.warningLevel == 3) {
                            color = "red";
                        }
                        return { color: color };
                    }
                })
                .bindPopup((layer) => {
                    return this.getPopupInfo(layer.feature.properties.ISO3166_2_CODE);
                })
                .addTo(this.map);
            hideLoader();
        }).catch(error => {
            console.log(error);
            hideLoader();
            if (error.status == 405) {
                if (this.index == 0) {
                    loadTable(listColums.Account, [], this.index + 1);
                    showToastMessenger('success', "Không có bản ghi nào cả hiuhiu!");
                } else {
                    showToastMessenger('danger', "Bạn đã đến trang cuối mất rồi!");
                    this.index = this.index - this.count;
                }
            } else {
                showToastMessenger('danger', "Đã có lỗi, vui lòng thử lại sau!");
            }
        })
    }

    getProvinceInfo(provinceCode) {
        let newCode = `|${provinceCode.substring(3)}|`;
        return this.data.find(x => x.unitCode == newCode);
    }

    getPopupInfo(provinceCode) {
        let provinceInfo = this.getProvinceInfo(provinceCode);
        return `
        <table>
            <tr>
                <td>${provinceInfo.unitName}</td>
                <td>${provinceCode}</td>
            </tr>
            <tr>
                <td>Tổng số ca</td>
                <td>${provinceInfo.totalCases}</td>
            </tr>
            <tr>
                <td>Số ca tử vong</td>
                <td>${provinceInfo.totalDeaths}</td>
            </tr>
            <tr>
                <td>Số ca hồi phục</td>
                <td>${provinceInfo.totalRecovereds}</td>
            </tr>
            <tr>
                <td>Mức độ cảnh báo</td>
                <td>${provinceInfo.warningLevel}</td>
            </tr>
        </table>`
    }
}