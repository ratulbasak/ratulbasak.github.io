var
    form,
 a4 = [595.28, 841.89]; // for a4 size paper width and height
$(document).ready(function () {
    $(".create_pdf").on("click", function (e) {
        $('body').scrollTop(0);
        var selector = $(e.target).attr('myprint');
        createPDF(selector);
    });
});

function createPDF(selector) {
    form = $(selector);
    getCanvas().then(function (canvas) {
        var cache_width = form.width()

        var
         img = canvas.toDataURL("image/png"),
         doc = new jsPDF({
             unit: 'px',
             format: 'a4'
         });
        doc.addImage(img, 'JPEG', 20, 20);
        doc.save('techumber-html-to-pdf.pdf');
        form.width(cache_width);
    });
}

// create canvas object
function getCanvas() {

    form.width((a4[0] * 1.33333) - 80).css('max-width', 'none');
    return html2canvas(form, {
        imageTimeout: 2000,
        removeContainer: true
    });
}
