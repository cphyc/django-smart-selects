"use strict";
(function($) {
    chainedm2m = function() {
        return {
            fireEvent: function(element,event) {
                var evt;
                if (document.createEventObject){
                    // dispatch for IE
                    evt = document.createEventObject();
                    return element.fireEvent('on'+event,evt);
                }
                else{
                    // dispatch for firefox + others
                    evt = document.createEvent("HTMLEvents");
                    evt.initEvent(event, true, true ); // event type,bubbling,cancelable
                    return !element.dispatchEvent(evt);
                }
            },

            dismissRelatedLookupPopup: function(win, chosenId) {
                var name = windowname_to_id(win.name);
                var elem = document.getElementById(name);
                if (elem.className.indexOf('vManyToManyRawIdAdminField') != -1 && elem.value) {
                    elem.value += ',' + chosenId;
                } else {
                    elem.value = chosenId;
                }
                fireEvent(elem, 'change');
                win.close();
            },

            fill_field: function(val, initial_value, elem_id, url, initial_parent, auto_choose){
                function trigger_chosen_updated() {
                    if ($.fn.chosen !== undefined) {
                        $(elem_id).trigger('chosen:updated');
                    }
                }

                if (!val || val === ''){
                    $(elem_id).html('');
                    trigger_chosen_updated();
                    return;
                }

                // Make sure that these are always an arrays
                val = [].concat(val);
                initial_parent = [].concat(initial_parent);

                var target_url = url + "/" + val + "/";
                $.getJSON(target_url, function(j){
                    var options = '';

                    for (var i = 0; i < j.length; i++) {
                        options += '<option value="' + j[i].value + '">' + j[i].display + '<'+'/option>';
                    }
                    var width = $(elem_id).outerWidth();
                    $(elem_id).html(options);
                    if (navigator.appVersion.indexOf("MSIE") != -1)
                        $(elem_id).width(width + 'px');

                    // if val and initial_parent have any common values, we need to set selected options.
                    if($(val).filter(initial_parent).length > 0) {
                        for (i = 0; i < initial_value.length; i++) {
                            $(elem_id + ' option[value="'+ initial_value[i] +'"]').attr('selected', 'selected');
                        }
                    }
                    if(auto_choose && j.length == 1){
                        $(elem_id + ' option[value="'+ j[0].value +'"]').attr('selected', 'selected');
                    }

                    $(elem_id).trigger('change');

                    trigger_chosen_updated();
                });
            },

            init: function(chainfield_watch, chainfield_val, url, id, value, auto_choose) {
                var initial_parent = $(chainfield_watch).val();
                var initial_value = value;

                if(!$(chainfield_val).hasClass("chained")){
                    var val = $(chainfield_val).val();
                    this.fill_field(val, initial_value, id, url, initial_parent, auto_choose);
                }
                var fill_field = this.fill_field;
                $(chainfield_watch).change(function(){
                    setTimeout(function(){
                        var localID = id;
                        if (localID.indexOf("__prefix__") > -1) {
                            var prefix = $(this).attr("id").match(/\d+/)[0];
                            localID = localID.replace("__prefix__", prefix);
                        }

                        var start_value = $(localID).val();
                        var val = $(chainfield_val).val();
                        fill_field(val, initial_value, localID, url, initial_parent, auto_choose);
                    }, 100);
                });

                // allait en bas, hors du documentready
                if (typeof(dismissAddAnotherPopup) !== 'undefined') {
                    var oldDismissAddAnotherPopup = dismissAddAnotherPopup;
                    dismissAddAnotherPopup = function(win, newId, newRepr) {
                        oldDismissAddAnotherPopup(win, newId, newRepr);
                        if ("#" + windowname_to_id(win.name) == chainfield_watch) {
                            $(chainfield_watch).change();
                        }
                    };
                }
            }
        };
    }();
})(jQuery || django.jQuery);
