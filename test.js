var index;

window.onload = function() {
    index = 0;
    initEvent();
}

function initEvent() {
    document.querySelector('#cbbProvince').addEventListener('keyup', (e) => {
        if (e.keyCode == 13) {
            alert(e.target.value);
        }
    });

    document.querySelector('.button.button-secondary').addEventListener('click', () => {
        document.querySelector('#cbbProvince').querySelector('input').value = "Nguyễn Văn Hiếu";
        document.querySelector('.test-div').prepend(parseHTML(`<i class="fas fa-angle-down"></i> <b>Hiếu ${index++}</b>`));
    });

    document.querySelector('.button.button-primary').addEventListener('click', () => {
        document.querySelector('.test-div').innerHTML = '';
        index = 0;
    });
}

function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}