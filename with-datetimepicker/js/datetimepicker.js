(function() {
    'use strict';
    jQuery.fn.dateTimePicker = function(options) {

        var settings = jQuery.extend({
            selectData: "now",
            dateFormat: "YYYY-MM-DD HH:mm",
            showTime: true,
            locale: 'en',
            positionShift: { top: 20, left: 0 },
            title: "Select Date and Time",
            buttonTitle: "Select"
        }, options);
        moment.locale(settings.locale);
        var elem = this;
        var limitation = { "hour": 23, "minute": 59 };
        var mousedown = false;
        var timeout = 800;
        var selectDate = settings.selectData == "now" ? moment() : moment(settings.selectData, settings.dateFormat);
        if (selectDate < moment()) {
            selectDate = moment();
        }
        var startDate = copyDate(moment());
        var lastSelected = copyDate(selectDate);
        return this.each(function() {
            if (lastSelected != selectDate) {
                selectDate = copyDate(lastSelected);
            }
            elem.addClass("dtp_main");
            updateMainElemGlobal();
            //  elem.text(selectDate.format(settings.dateFormat));
            function updateMainElemGlobal() {
                var arrF = settings.dateFormat.split(' ');
                if (settings.showTime && arrF.length != 2) {
                    arrF.length = 2;
                    arrF[0] = 'DD/MM/YY';
                    arrF[1] = 'HH:mm';
                }
                var sVar = jQuery('<span>');
                sVar.text(lastSelected.format(arrF[0]));
                elem.empty();
                elem.append(sVar);
                sVar = jQuery('<i>');
                sVar.addClass('fa fa-calendar ico-size');
                elem.append(sVar);
                if (settings.showTime) {
                    sVar = jQuery('<span>');
                    sVar.text(lastSelected.format(arrF[1]));
                    elem.append(sVar);
                    sVar = jQuery('<i>');
                    sVar.addClass('fa fa-clock-o ico-size');
                    elem.append(sVar);
                }
            }
            elem.on('click', function() {
                var winVar = jQuery('<div>');
                winVar.addClass("dtp_modal-win");
                var bodyVar = jQuery('body');
                bodyVar.append(winVar);
                var contentVar = createContent();
                bodyVar.append(contentVar);
                var offset = elem.offset();
                contentVar.css({ top: (offset.top + settings.positionShift.top) + "px", left: (offset.left + settings.positionShift.left) + "px" });
                feelDates(selectDate);
                winVar.on('click', function() {
                    contentVar.remove();
                    winVar.remove();
                })
                if (settings.showTime) {
                    attachChangeTime();
                    var fieldTimeVar = jQuery('#field-time');
                    var hourVar = fieldTimeVar.find('#d-hh');
                    var mVarinute = fieldTimeVar.find('#d-mm');
                }

                function feelDates(selectM) {
                    var fDateVar = contentVar.find('#field-data');
                    fDateVar.empty();
                    fDateVar.append(createMonthPanel(selectM));
                    fDateVar.append(createCalendar(selectM));
                }

                function createCalendar(selectedMonth) {
                    var cVar = jQuery('<div>');
                    cVar.addClass('dtp_modal-calendar');
                    for (var i = 0; i < 7; i++) {
                        var eVar = jQuery('<div>');
                        eVar.addClass('dtp_modal-calendar-cell dtp_modal-colored');
                        eVar.text(moment().weekday(i).format('ddd'));
                        cVar.append(eVar);
                    }
                    var m = copyDate(selectedMonth);
                    m.date(1);
                    // console.log(m.format('DD--MM--YYYY'));
                    // console.log(selectData.format('DD--MM--YYYY'));
                    // console.log(m.weekday());
                    var flagStart = totalMonths(selectedMonth) === totalMonths(startDate);
                    var flagSelect = totalMonths(lastSelected) === totalMonths(selectedMonth);
                    var cerDay = parseInt(selectedMonth.format('D'));
                    var dayNow = parseInt(startDate.format('D'));
                    for (var i = 0; i < 6; i++) {
                        for (var j = 0; j < 7; j++) {
                            var bVar = jQuery('<div>');
                            bVar.html('&nbsp;');
                            bVar.addClass('dtp_modal-calendar-cell');
                            if (m.month() == selectedMonth.month() && m.weekday() == j) {
                                var day = parseInt(m.format('D'));
                                bVar.text(day);
                                if (flagStart && day < dayNow) {
                                    bVar.addClass('dtp_modal-grey');
                                } else if (flagSelect && day == cerDay) {
                                    bVar.addClass('dtp_modal-cell-selected');
                                } else {
                                    bVar.addClass('cursorily');
                                    bVar.bind('click', changeDate);
                                }
                                m.add(1, 'days');
                            }
                            cVar.append(bVar);
                        }
                    }
                    return cVar;
                }

                function changeDate() {

                    var divVar = jQuery(this);
                    selectDate.date(divVar.text());
                    lastSelected = copyDate(selectDate);
                    updateDate();
                    var fDateVar = contentVar.find('#field-data');
                    var old = fDateVar.find('.dtp_modal-cell-selected');
                    old.removeClass('dtp_modal-cell-selected');
                    old.addClass('cursorily');
                    divVar.addClass('dtp_modal-cell-selected');
                    divVar.removeClass('cursorily');
                    old.bind('click', changeDate);
                    divVar.unbind('click');
                    // console.log(selectDate.format('DD-MM-YYYY'));
                }

                function createMonthPanel(selectMonth) {
                    var dVar = jQuery('<div>');
                    dVar.addClass('dtp_modal-months');
                    var sVar = jQuery('<i></i>');
                    sVar.addClass('fa fa-angle-left cursorily ico-size-month hov');
                    //sVar.attr('data-fa-mask', 'fas fa-circle');
                    sVar.bind('click', prevMonth);
                    dVar.append(sVar);
                    sVar = jQuery('<span>');
                    sVar.text(selectMonth.format("MMMM YYYY"));
                    dVar.append(sVar);
                    sVar = jQuery('<i></i>');
                    sVar.addClass('fa fa-angle-right cursorily ico-size-month hov');
                    sVar.bind('click', nextMonth);
                    dVar.append(sVar);
                    return dVar;
                }

                function close() {
                    if (settings.showTime) {
                        lastSelected.hour(parseInt(hourVar.text()));
                        lastSelected.minute(parseInt(mVarinute.text()));
                        selectDate.hour(parseInt(hourVar.text()));
                        selectDate.minute(parseInt(mVarinute.text()));
                    }
                    updateDate();
                    contentVar.remove();
                    winVar.remove();
                }

                function nextMonth() {
                    selectDate.add(1, 'month');
                    feelDates(selectDate);
                }

                function prevMonth() {
                    if (totalMonths(selectDate) > totalMonths(startDate)) {
                        selectDate.add(-1, 'month');
                        feelDates(selectDate);
                    }
                }

                function attachChangeTime() {
                    var anglesVar = jQuery(contentVar).find('i[id^="angle-"]');
                    // anglesVar.bind('click', changeTime);
                    anglesVar.bind('mouseup', function() {
                        mousedown = false;
                        timeout = 800;
                    });
                    anglesVar.bind('mousedown', function() {
                        mousedown = true;
                        changeTime(this);
                    });
                }

                function changeTime(el) {
                    var elVar = this || el;
                    elVar = jQuery(elVar);
                    ///angle-up-hour angle-up-minute angle-down-hour angle-down-minute
                    var arr = elVar.attr('id').split('-');
                    var increment = 1;
                    if (arr[1] == 'down') {
                        increment = -1;
                    }
                    appendIncrement(arr[2], increment);
                    setTimeout(function() {
                        autoIncrement(elVar);
                    }, timeout);
                }

                function autoIncrement(el) {
                    if (mousedown) {
                        if (timeout > 200) {
                            timeout -= 200;
                        }
                        changeTime(el);
                    }
                }

                function appendIncrement(typeDigits, increment) {

                    var iVar = typeDigits == "hour" ? hourVar : mVarinute;
                    var val = parseInt(iVar.text()) + increment;
                    if (val < 0) {
                        val = limitation[typeDigits];
                    } else if (val > limitation[typeDigits]) {
                        val = 0;
                    }
                    iVar.text(formatDigits(val));
                }

                function formatDigits(val) {

                    if (val < 10) {
                        return '0' + val;
                    }
                    return val;
                }

                function createTimer() {
                    var divVar = jQuery('<div>');
                    divVar.addClass('dtp_modal-time-mechanic');
                    var panelVar = jQuery('<div>');
                    panelVar.addClass('dtp_modal-append');
                    var iVar = jQuery('<i>');
                    iVar.attr('id', 'angle-up-hour');
                    iVar.addClass('fa fa-angle-up ico-size-large cursorily hov');
                    panelVar.append(iVar);
                    var mVar = jQuery('<span>');
                    mVar.addClass('dtp_modal-midle');
                    panelVar.append(mVar);
                    iVar = jQuery('<i>');
                    iVar.attr('id', 'angle-up-minute');
                    iVar.addClass('fa fa-angle-up ico-size-large cursorily hov');
                    panelVar.append(iVar);
                    divVar.append(panelVar);

                    panelVar = jQuery('<div>');
                    panelVar.addClass('dtp_modal-digits');
                    var dVar = jQuery('<span>');
                    dVar.addClass('dtp_modal-digit');
                    dVar.attr('id', 'd-hh');
                    dVar.text(lastSelected.format('HH'));
                    panelVar.append(dVar);
                    mVar = jQuery('<span>');
                    mVar.addClass('dtp_modal-midle-dig');
                    mVar.html(':');
                    panelVar.append(mVar);
                    dVar = jQuery('<span>');
                    dVar.addClass('dtp_modal-digit');
                    dVar.attr('id', 'd-mm');
                    dVar.text(lastSelected.format('mm'));
                    panelVar.append(dVar);
                    divVar.append(panelVar);

                    panelVar = jQuery('<div>');
                    panelVar.addClass('dtp_modal-append');
                    iVar = jQuery('<i>');
                    iVar.attr('id', 'angle-down-hour');
                    iVar.addClass('fa fa-angle-down ico-size-large cursorily hov');
                    panelVar.append(iVar);
                    mVar = jQuery('<span>');
                    mVar.addClass('dtp_modal-midle');
                    panelVar.append(mVar);
                    iVar = jQuery('<i>');
                    iVar.attr('id', 'angle-down-minute');
                    iVar.addClass('fa fa-angle-down ico-size-large cursorily hov');
                    panelVar.append(iVar);
                    divVar.append(panelVar);
                    return divVar;
                }

                function createContent() {
                    var cVar = jQuery('<div>');
                    if (settings.showTime) {
                        cVar.addClass("dtp_modal-content");
                    } else {
                        cVar.addClass("dtp_modal-content-no-time");
                    }
                    var elVar = jQuery('<div>');
                    elVar.addClass("dtp_modal-title");
                    elVar.text(settings.title);
                    cVar.append(elVar);
                    elVar = jQuery('<div>');
                    elVar.addClass('dtp_modal-cell-date');
                    elVar.attr('id', 'field-data');
                    cVar.append(elVar);
                    if (settings.showTime) {
                        elVar = jQuery('<div>');
                        elVar.addClass('dtp_modal-cell-time');
                        var aVar = jQuery('<div>');
                        aVar.addClass('dtp_modal-time-block');
                        aVar.attr('id', 'field-time');
                        elVar.append(aVar);
                        var lineVar = jQuery('<div>');
                        lineVar.attr('id', 'time-line');
                        lineVar.addClass('dtp_modal-time-line');
                        lineVar.text(lastSelected.format(settings.dateFormat));

                        aVar.append(lineVar);
                        aVar.append(createTimer());
                        var butVar = jQuery('<div>');
                        butVar.addClass('dpt_modal-button');
                        butVar.text(settings.buttonTitle);
                        butVar.bind('click', close);
                        elVar.append(butVar);
                        cVar.append(elVar);
                    }
                    return cVar;
                }

                function updateDate() {
                    if (settings.showTime) {
                        jQuery('#time-line').text(lastSelected.format(settings.dateFormat));
                    }
                    updateMainElem();
                    elem.next().val(selectDate.format(settings.dateFormat));
                    if (!settings.showTime) {
                        contentVar.remove();
                        winVar.remove();
                    }
                }

                function updateMainElem() {
                    var arrF = settings.dateFormat.split(' ');
                    if (settings.showTime && arrF.length != 2) {
                        arrF.length = 2;
                        arrF[0] = 'DD/MM/YY';
                        arrF[1] = 'HH:mm';
                    }
                    var sVar = jQuery('<span>');
                    sVar.text(lastSelected.format(arrF[0]));
                    elem.empty();
                    elem.append(sVar);
                    sVar = jQuery('<i>');
                    sVar.addClass('fa fa-calendar ico-size');
                    elem.append(sVar);
                    if (settings.showTime) {
                        sVar = jQuery('<span>');
                        sVar.text(lastSelected.format(arrF[1]));
                        elem.append(sVar);
                        sVar = jQuery('<i>');
                        sVar.addClass('fa fa-clock-o ico-size');
                        elem.append(sVar);
                    }
                }

            });

        });

    };

    function copyDate(d) {
        return moment(d.toDate());
    }

    function totalMonths(m) {
        var r = m.format('YYYY') * 12 + parseInt(m.format('MM'));
        return r;
    }

}());
// fa-caret-down