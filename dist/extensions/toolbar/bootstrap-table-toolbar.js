/**
 * @author: aperez <aperez@datadec.es>
 * @version: v2.0.0
 *
 * @update Dennis Hernández <http://djhvscf.github.io/Blog>
 */

!function($) {
    'use strict';

    var firstLoad = false;

    var sprintf = $.fn.bootstrapTable.utils.sprintf;

    var showAvdSearch = function(pColumns, searchTitle, searchText, that) {
        var searchModel = $("#avdSearchModal" + "_" + that.options.idTable);
        if (!searchModel.hasClass("modal")) {
            var vModal = sprintf("<div id=\"avdSearchModal%s\"  class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"mySmallModalLabel\" aria-hidden=\"true\">", "_" + that.options.idTable);
            vModal += "<div class=\"modal-dialog modal-xs\">";
            vModal += " <div class=\"modal-content\">";
            vModal += "  <div class=\"modal-header\">";
            vModal += "   <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\" >&times;</button>";
            vModal += sprintf("   <h4 class=\"modal-title\">%s</h4>", searchTitle);
            vModal += "  </div>";
            vModal += "  <div class=\"modal-body modal-body-custom\">";
            vModal += sprintf("   <div class=\"container-fluid\" id=\"avdSearchModalContent%s\" style=\"padding-right: 0px;padding-left: 0px;\" >", "_" + that.options.idTable);
            vModal += "   </div>";
            vModal += "  </div>";
            vModal += "  </div>";
            vModal += " </div>";
            vModal += "</div>";

            $("body").append($(vModal));

            var vFormAvd = createFormAvd(pColumns, searchText, that),
                timeoutId = 0;

            var searchModelContent = $('#avdSearchModalContent' + "_" + that.options.idTable);
            searchModelContent.append(vFormAvd.join(''))

            $('#' + that.options.idForm).off('keyup blur', 'input').on('keyup blur', 'input', function (event) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function () {
                    that.onColumnAdvancedSearch(event);
                }, that.options.searchTimeOut);
            })
            .find('select.selectFilter').select2({
                dropdownParent: searchModelContent,
                tags:true,
                escapeMarkup: function (markup) {
                    return markup;
                },
                containerCssClass: ':all:'
            })
            .change(function(event){
                var newValue = $('<div/>').text($(event.currentTarget).val()).html();
                that.onColumnAdvancedSearch(event, $(event.currentTarget).find("option[data-ComboBoxOriginal][value='" + newValue + "']").length > 0);
            }).addClass("Done");

            $("#btnCloseAvd" + "_" + that.options.idTable).click(function() {
                $("#avdSearchModal" + "_" + that.options.idTable).modal('hide');
            });

            $("#avdSearchModal" + "_" + that.options.idTable).modal();
        } else {
            $("#avdSearchModal" + "_" + that.options.idTable).modal();
        }
    };

    var createFormAvd = function(pColumns, searchText, that) {
        var htmlForm = [];
        htmlForm.push(sprintf('<form class="form-horizontal" id="%s" action="%s" >', that.options.idForm, that.options.actionForm));
        for (var i in pColumns) {
            var vObjCol = pColumns[i];
            if (!vObjCol.checkbox && vObjCol.visible && vObjCol.searchable) {
                htmlForm.push('<div class="form-group">');
                htmlForm.push(sprintf('<label class="col-sm-4 control-label">%s</label>', vObjCol.title));
                htmlForm.push('<div class="col-sm-6">');

                var value = "";
                if (typeof that.filterColumnsPartial != "undefined" && that.filterColumnsPartial.hasOwnProperty(vObjCol.field)) {
                   value = that.filterColumnsPartial[vObjCol.field];
                }
                var input = '';
                switch(vObjCol.type){
                    case 'select':
                        var values = [];
                        if(vObjCol.filterData){
                            values = vObjCol.filterData;
                        } else {
                            that.options.data.forEach(function(row) {
                                var rowValue = row[vObjCol.field];
                                if (rowValue != '' && values.indexOf(rowValue) == -1) values.push(rowValue);
                            });
                            values = $.unique(values);
                        }

                        input = sprintf('<select class="selectFilter form-control" name="%s" id="%s" style="width:100%"><option></option>', vObjCol.title, vObjCol.field);

                        if(values.constructor === Array){
                            values.forEach(function(rowValue){
                                input+= '<option data-ComboBoxOriginal' + (value == rowValue ? ' selected="selected" ': '') + ' value="'+rowValue+'">' + rowValue + '</option>';
                            });
                        } else {
                            for (var row in values) {
                                if(!values.hasOwnProperty(row)) continue;
                                var rowValue = values[row];
                                input+= '<option data-ComboBoxOriginal' + (value == rowValue ? ' selected="selected" ': '') + ' value="'+row+'">' + rowValue + '</option>';
                            }
                        }
                        input += '</select>';
                    break;
                    default:
                        input = sprintf('<input type="text" class="form-control input-md" name="%s" placeholder="%s" id="%s" value="%s">', vObjCol.field, vObjCol.title, vObjCol.field, value);
                    break;
                }

                htmlForm.push(input);
                htmlForm.push('</div>');
                htmlForm.push('</div>');
            }
        }

        htmlForm.push('<div class="form-group">');
        htmlForm.push('<div class="col-sm-offset-9 col-sm-3">');
        htmlForm.push(sprintf('<button type="button" id="btnCloseAvd%s" class="btn btn-default" >%s</button>', "_" + that.options.idTable, searchText));
        htmlForm.push('</div>');
        htmlForm.push('</div>');
        htmlForm.push('</form>');

        return htmlForm;
    };

    $.extend($.fn.bootstrapTable.defaults, {
        advancedSearch: false,
        idForm: 'advancedSearch',
        actionForm: '',
        idTable: undefined,
        onColumnAdvancedSearch: function (field, text) {
            return false;
        }
    });

    $.extend($.fn.bootstrapTable.defaults.icons, {
        advancedSearchIcon: 'fa-search'
    });

    $.extend($.fn.bootstrapTable.Constructor.EVENTS, {
        'column-advanced-search.bs.table': 'onColumnAdvancedSearch'
    });

    $.extend($.fn.bootstrapTable.locales, {
        formatAdvancedSearch: function() {
            return 'Advanced search';
        },
        formatAdvancedCloseButton: function() {
            return "Close";
        }
    });

    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initToolbar = BootstrapTable.prototype.initToolbar,
        _load = BootstrapTable.prototype.load,
        _initSearch = BootstrapTable.prototype.initSearch;

    BootstrapTable.prototype.initToolbar = function() {
        _initToolbar.apply(this, Array.prototype.slice.apply(arguments));
        $.fn.bootstrapTable.methods.push('advancedFilterBy');

        if (!this.options.search) {
            return;
        }

        if (!this.options.advancedSearch) {
            return;
        }

        if (!this.options.idTable) {
            return;
        }

        var that = this,
            html = [];

        //html.push(sprintf('<div class="columns columns-%s btn-group pull-%s" role="group">', this.options.buttonsAlign, this.options.buttonsAlign));
        html.push(sprintf('<button class="btn btn-default%s' + '" type="button" name="advancedSearch" title="%s">', that.options.iconSize === undefined ? '' : ' btn-' + that.options.iconSize, that.options.formatAdvancedSearch()));
        html.push(sprintf('<i class="%s %s"></i>', that.options.iconsPrefix, that.options.icons.advancedSearchIcon))
        html.push('</button>');
        //html.push('</div>');

        that.$toolbar.children(".btn-group").append(html.join(''));

        that.$toolbar.find('button[name="advancedSearch"]')
            .off('click').on('click', function() {
                showAvdSearch(that.columns, that.options.formatAdvancedSearch(), that.options.formatAdvancedCloseButton(), that);
            });
    };

    BootstrapTable.prototype.load = function(data) {
        _load.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.advancedSearch) {
            return;
        }

        if (typeof this.options.idTable === 'undefined') {
            return;
        } else {
            if (!firstLoad) {
                var height = parseInt($(".bootstrap-table").height());
                height += 10;
                $("#" + this.options.idTable).bootstrapTable("resetView", {height: height});
                firstLoad = true;
            }
        }
    };

    BootstrapTable.prototype.initSearch = function (strictOveride) {
        _initSearch.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.advancedSearch) {
            return;
        }

        var that = this;
        var strictSearch = typeof strictOveride !== 'undefined' ? strictOveride : that.options.strictSearch;
        var fp = $.isEmptyObject(this.filterColumnsPartial) ? null : this.filterColumnsPartial;

        this.data = fp ? $.grep(this.data, function (item, i) {
            for (var key in fp) {
                var fval = fp[key].toLowerCase();
                var value = item[key];
                var columnIndex = $.inArray(key, that.header.fields);
                value = $.fn.bootstrapTable.utils.calculateObjectValue(that.header,
                    that.header.formatters[columnIndex],
                    [value, item, i, that.columns[columnIndex]], value);

                if (!($.inArray(key, that.header.fields) !== -1 && (typeof value === 'string' || typeof value === 'number'))) {
                    if((strictSearch && (value + '').toLowerCase() !== fval) || (!strictSearch && (value + '').toLowerCase().indexOf(fval) !== -1)){
                        return false;
                    }
                }
            }
            return true;
        }) : this.data;
    };

    BootstrapTable.prototype.onColumnAdvancedSearch = function (event, strictOveride) {
        var text = $('<div/>').text($.trim($(event.currentTarget).val())).html();
        var $field = $(event.currentTarget)[0].id;

        if ($.isEmptyObject(this.filterColumnsPartial)) {
            this.filterColumnsPartial = {};
        }
        if (text) {
            this.filterColumnsPartial[$field] = text;
        } else {
            delete this.filterColumnsPartial[$field];
        }

        this.options.pageNumber = 1;
        this.onSearch(event, strictOveride);
        this.updatePagination();
        this.trigger('column-advanced-search', $field, text);
    };

    BootstrapTable.prototype.advancedFilterBy = function (columns) {
        var filters = this.filterColumnsPartial = $.isEmptyObject(columns) ? {} : columns;
        var form = $("#" + this.options.idForm).find('.form-control').each(function(index){
            var value = filters.hasOwnProperty(this.id) ? filters[this.id] : "";
            var jThis = $(this);
            jThis.val(value);
            if(jThis.is('select')) $('#select2-' + jThis.attr('id') + '-container').text(value);
        });

        this.options.pageNumber = 1;
        this.initSearch();
        this.updatePagination();
    };
}(jQuery);
