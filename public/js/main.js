var socket = io();
var config = {
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)'
    ],

    components: {
        preview: true,
        opacity: true,
        hue: true,

        interaction: {
            hex: true,
            rgba: true,
            hsva: true,
            input: true,
            clear: true,
            save: true
        }
    }
};

pickr = new Pickr(Object.assign({
    el: '.pickr',
    theme: 'classic',
    default: '#42445a'
}, config));

var input_text = document.querySelector('.input_text').addEventListener('input', function (event) {
    var text = event.target.value;
    var current_color = pickr.getSelectedColor().toRGBA().slice(0, 3).map(c => Math.round(c));
    socket.emit('change_letter', {
       "letter": text,
       "color_code": current_color
    });
});

pickr.on('init', instance => {
    // console.log('init', instance);
}).on('hide', instance => {
    // console.log('hide', instance);
}).on('show', (color, instance) => {
    // console.log('show', color, instance);
}).on('save', (color, instance) => {
    // console.log('save', color, instance);
}).on('clear', instance => {
    // console.log('clear', instance);
}).on('change', (color, instance) => {
    socket.emit('change_color', {
        "color_code": color.toRGBA().slice(0, 3).map(c => Math.round(c))
    });
    // console.log('change', color, instance);
}).on('changestop', instance => {
    // console.log('changestop', instance);
}).on('cancel', instance => {
    // console.log('cancel', instance);
}).on('swatchselect', (color, instance) => {
    // console.log('swatchselect', color, instance);
});

socket.on('server_connected', function (data) {
    console.log(data.message);
});

const CELL_SIZE = '50px';

class Table
{
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.table = document.createElement('table');
        this.table.setAttribute('id', 'matrix');

        for (let i = 0; i < this.width; i++) {
            var row = document.createElement('tr');
            for (let j = 0; j < this.height; j++) {
                var column = document.createElement('td');
                column.setAttribute('id', i + '_' + j);
                column.setAttribute('width', CELL_SIZE);
                column.setAttribute('height', CELL_SIZE);
                row.appendChild(column);
            }

            this.table.appendChild(row);
        }
    }

    update() {
        document.getElementById('matrix').replaceWith(this.table);
    }

    setColorTo(row, column, color) {
        console.log(row, column);
        document.getElementById(row + '_' + column).style.backgroundColor = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    }
}

var table = new Table(8, 8);
table.update();

socket.on('update_matrix', function (data) {
    let updated_matrix = data.matrix;

    console.log(updated_matrix);

    for (let i=0; i < updated_matrix.length; i++) {
        for (let j=0; j < updated_matrix[i].length; j++) {
            let color = updated_matrix[i][j];
            table.setColorTo(i, j, color);
        }
    }
});