authApi = null;
personApi = null;
adminApi = null;
unitApi = null;
unitDetail = null;

const firebaseConfig = {
    apiKey: "AIzaSyAKWLInk3HEpmsL438LX41LXuVYROs_DYE",
    authDomain: "pandemic-management-1f2fd.firebaseapp.com",
    projectId: "pandemic-management-1f2fd",
    storageBucket: "pandemic-management-1f2fd.appspot.com",
    messagingSenderId: "60561382808",
    appId: "1:60561382808:web:f3977c82b16d6310ca5fed",
    measurementId: "G-TR2HC0H8SP"
};
firebase.initializeApp(firebaseConfig);

window.onload = () => {
    authApi = new AuthApi();
    unitApi = new UnitApi();
    initEvent();
}

function initEvent() {
    document.querySelector('#checkProvince').addEventListener('click', () => {
        if (getValueRGB(document.querySelector('#valueRole')) !== 0) {
            document.querySelector('#valueDistrict input').disabled = true;
            document.querySelector('#valueWard input').disabled = true;
        }
    })
    document.querySelector('#checkDistrict').addEventListener('click', () => {
        if (getValueRGB(document.querySelector('#valueRole')) !== 0) {
            document.querySelector('#valueDistrict input').disabled = false;
            document.querySelector('#valueWard input').disabled = true;
        }
    })
    document.querySelector('#checkWard').addEventListener('click', () => {
        if (getValueRGB(document.querySelector('#valueRole')) !== 0) {
            document.querySelector('#valueDistrict input').disabled = false;
            document.querySelector('#valueWard input').disabled = false;
        }
    })

    document.querySelector('#btnRegister').addEventListener('click', () => {



        var type = getValueRGB(document.querySelector('#valueRole'));
        var phoneNumber = document.querySelector('#valuePhoneNumber').value;
        var password = document.querySelector('#valuePassword').value;
        var password2 = document.querySelector('#valuePassword2').value;
        var unitCode = getUnitCode(type);

        var file = document.querySelector("#valueFile").files[0];

        if (type != 0 && !file) {
            showToastMessenger("danger", "Bạn chưa tải lên tài liệu và chứng chỉ liên quan!");
        } else {
            if (password !== password2) {
                showToastMessenger("danger", "Mật khẩu nhập lại chưa khớp!");
            } else {

                // tải lên file 
                const storageRef = firebase.storage().ref();
                const final = storageRef.child(`${phoneNumber}.png`);
                const task = final.put(file);
                task.on('state_changed',
                    function progress(progress) {
                        console.log(progress.bytesTransferred / progress.totalBytes * 100)
                    },
                    function error(err) {
                        console.log(err);
                        showToastMessenger('danger', err);
                    },
                    function completed() {
                        newacc = { phoneNumber, password, type, unitCode, unitDetail };
                        console.log(newacc);
                        authApi.signup(newacc).then(res => {
                            /// tải ảnh
                            showToastMessenger("success", "Đăng kí tài khoản thành công!");
                            setTimeout(() => {
                                window.location.href = "./index.html";
                            }, 2000)
                            console.log(res);
                        }).catch(error => {
                            if (error.status == 422) {
                                showToastMessenger("danger", "Tài khoản đã tồn tại!");
                            } else {
                                showToastMessenger("danger", "Đăng kí thất bại. Vui lòng thử lại sau!");
                            }
                            console.log(error);
                        })
                    }
                )
            }
        }
    })
}

function getUnitCode(role) {
    unitDetail = "";
    var province = document.querySelector('#valueProvince input').value;
    var district = document.querySelector('#valueDistrict input').value;
    var ward = document.querySelector('#valueWard input').value;
    if (role == 0) {
        unitDetail = `${ward}, ${district}, ${province}`;
        return document.querySelector('#valueWard').getAttribute('value');
    } else {
        var unitLevel = getValueRGB(document.querySelector('#checkUnit'));
        if (unitLevel == "province") {
            unitDetail = `${province}`;
            return document.querySelector('#valueProvince').getAttribute('value');
        } else if (unitLevel == "district") {
            unitDetail = `${district}, ${province}`;
            return document.querySelector('#valueDistrict').getAttribute('value');
        } else {
            unitDetail = `${ward}, ${district}, ${province}`;
            return document.querySelector('#valueWard').getAttribute('value');
        }
    }
}
