(function ($) {
    //$("[validate]").parentsUntil('[validation-option]').each(function () {
        //var options = JSON.parse($(this).attr('[validation-option]'));
        //if (options.onchange) {
    $(document).ready(function () {
        $("[validate]").focusout(validate);
    });
        //}
    //});
    $.fn.validate = function () {
        var output = { isValid: true, message: "", results: [] };
        this.each(function () {
            $(this).find("[validate]").each(function () {
                var res = $(this).data('ValidationResult');
                if (!res) {
                    res = validate({ Element: this });
                }
                if (!res.isValid) {
                    output.isValid = false;
                    output.message += "\n" + res.message;
                }
                $(output.results).append(res);
            });
        });
        return output;
    };
    $.fn.validation = function (options) {
        if (options) {
            this.each(function () {
                var validationOption = $(this).data("ValidationOption");
                validationOption = validationOption ? validationOption : {};
                $.extend(validationOption, options);
                $(this).data("ValidationOption", validationOption);
            });
            return this;
        }else{
            return $(this).data("ValidationOption");
        }
    };

    $.fn.clearValidationResult = function () {
        this.each(function () {
            $(this).find('[validate]').each(function () {
                $(this).removeData("ValidationResult");
                OverlayMessage({ isValid: true, control:this });
            });
        });
    }
    //$.SetStatus = function (selector, value) {
    //    var res = value ?
    //                typeof value.isValid !== "undefined" ?
    //                    typeof value.message !== 'undefined' ?
    //                        { isValid: value.isValid, message: value.message }
    //                        : { isValid: value.isValid, message: '' }
    //                    : undefined
    //                : undefined;
    //    if (res) {
    //        $(selector).data(('ValidationResult', res));
    //    }
    //};
}(jQuery));
function OverlayMessage(result, options) {
    if (result.isValid) {
        //$("#_overlay").css({ "top": $("#txtProductCode").offset().top, "left": $("#txtProductCode").offset().left, "height": $("#txtProductCode").height(), "width": $("#txtProductCode").width() })
        $(result.control).css({ "border-color": "" });
        $(result.control).tooltip({ disabled: true });

    } else if (result.isValid == false) {
        //var rect = result.control.getBoundingClientRect();
        //var height = $(result.control).height();
        //var width = $(result.control).width();
        $(result.control).css({ "border-color": "red" });
        $(result.control).tooltip({ content: result.message });
        //$(result.control).attr("title", result.message)
        //$(result.control).tooltip();
    } else {
        $(result.control).css({ "border-color": "green" });
    }
}

function validate(opts) {
    var Element = 'object' === typeof opts ? opts.Element ? opts.Element : this : this ;
    var options = $(Element).attr("validate");
    if (options) {
        options = eval('options={' + options + '}');
        $.extend(options, { value: $(Element).val() });
        $.extend(options, { Element: Element });
        var validationOption = $(Element).data("ValidationOption");
        if (validationOption) {
            $.extend(options, validationOption);
        }
        if ($(Element).attr('caption')) { $.extend(options, { caption: $(Element).attr('caption') }); }
        var res = Validation.validate(options);
        $(Element).data('ValidationResult', res)
        $.extend(res, { control: Element });
        OverlayMessage(res);
        return res;
    }
}

Validation = {
    ValidationResult: function (IsValid, Message) {
        this.isValid = true;
        this.message = "";
        this.control = null;
        if ('undefined' != typeof IsValid) {
            if ('boolean' == typeof IsValid) {
                this.isValid = IsValid;
                this.message = Message ? Message : "";
            }
            else {
                $.extend(this, IsValid);
            }
        }
    },
    _callBack: function (type) {
        var ret = type.value();
        if (ret === false) {
            return new this.ValidationResult(false, type.errMessage);
        }
    },
    validate: function (options) {
        var isEmpty = false;
        if (options.url) {
            if (options.value !== '') {
                var url = {};
                if ("object" == typeof options.url) {
                    url.url = options.url.url;
                    url.errMessage = options.url.errMessage ? options.url.errMessage : options.errMessage ? options.errMessage : "the value provided in " + options.caption + " cannot be accepted.";
                }
                else {
                    url.url = options.url;
                    url.errMessage = "the value provided in " + options.caption + " cannot be accepted.";
                }
                var res = { isValid: false, message: 'processing..', control: options.Element };
                $.ajax({
                    type: "post",
                    contentType: "application/json; charset=utf-8",
                    url: url.url,
                    data: JSON.stringify({ value: options.value }),
                    dataType: "json",
                    async: true,
                    success: function (data, textStatus) {
                        var ret = JSON.parse(data.d);
                        if (typeof ret !== 'undefined' && ret === false) {
                            res.isValid = ret;
                            res.message = url.errMessage;
                            $(options.Element).data("ValidationResult", res);
                            OverlayMessage(res, options);
                        }
                    },
                    error: function () {
                        var res = { isValid: false, message: 'could not validate ' + options.caption + ' due to network error.' };
                        $(options.Element).data("ValidationResult", res);
                        OverlayMessage(res, options);
                    },
                    beforeSend: function () {
                        $(options.Element).data("ValidationResult", res);
                        OverlayMessage(res, options);
                    }
                });
            }
        }

        //validate for mandatory
        if (options.required) {
            if (options.value == undefined)
                return new this.ValidationResult(false, options.caption + " is required");
            if ('object' == typeof options.value)
                return new this.ValidationResult(false, options.caption + " is required");
            if ('string' == typeof options.value && options.value == "")
                return new this.ValidationResult(false, options.caption + " is required");
        }else{
            if (options.value == undefined)
                isEmpty = true;
            if ('object' == typeof options.value)
                isEmpty = true;
            if ('string' == typeof options.value && options.value == "")
                isEmpty = true;
        }

        //validate for minimum length of string
        if (options.minLength) {
            if (options.value.length < options.minLength) {
                return new this.ValidationResult(false, options.caption + " is less than minimum length of " + options.minLength + "characters");
            }
        }

        //validate for maximum length of string
        if (options.maxLength) {
            if (options.value.length > options.maxLength) {
                return new this.ValidationResult(false, options.caption + " is greater than maximum length of " + options.maxLength + "characters");
            }
        }

        //validate the value in a valid list
        if (options.allow) {
            var valid = false;
            for (var ele in options.allow) {
                if (ele == options.value) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                return new this.ValidationResult(false, options.errMessage ? options.errMessage : options.caption + " is not in the valid list");
            } else {
                return new this.ValidationResult(true);
            }
        }

        //validate the valuse not in the invalid list
        if (options.notAllow) {
            var valid = true;
            for (var ele in options.notAllow) {
                if (ele == options.value) {
                    valid = false;
                    break;
                }
            }
            if (!valid) {
                return new this.ValidationResult(false, options.errMessage ? options.errMessage : options.caption + " is in the invalid list");
            }
        }

        var type = {};
        if ('string' === typeof options.type) {
            type.value = options.type;
            type.errMessage = null;
        } else if (('object' === typeof options.type) && (options.type !== null)) {
            if ('function' === typeof options.type.value) {
                type.value = options.type.value;
                type.errMessage = options.type.errMessage ? options.type.errMessage : options.errMessage ? options.errMessage : options.caption + " is invalid";
                type.expr = null;
                return this._callBack(type);
            } else {
                type.value = options.type.value ? options.type.value : null;
                type.errMessage = options.type.errMessage ? options.type.errMessage : options.errMessage ? options.errMessage : null;
                type.expr = options.type.expr ? options.type.expr : null;
                type.allowContent = options.type.allowContent ? options.type.allowContent : null;
                if (options.type.notAllowContent) {
                    if ('string' === typeof options.type.notAllowContent) {
                        if (options.value.indexOf(options.type.notAllowContent) > -1) {
                            return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + "some characters of " + options.caption + "are not allowd");
                        }
                    }else if ('object' === typeof options.type.notAllowContent) {
                        for (var i = 0; i < options.type.notAllowContent.length; i++) {
                            if (options.value.indexOf(options.type.notAllowContent[i]) > -1) {
                                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + "some characters of " + options.caption + "are not allowd");
                            }
                        }
                    }
                }
                type.IsStartWithAlpha = options.type.IsStartWithAlpha ? true : false;
            }
        } else if ('function' === typeof options.type) {
            type.value = options.type;
            type.errMessage = options.errMessage ? options.errMessage : options.caption + " is invalid";
            type.expr = null;
            return this._callBack(type);
        } else {
            type.value = null;
            type.errMessage = null;
            type.expr = null;
        }

        //validate for number
        if (type.value === 'number') {
            var val = options.value;
            if (type.allowContent) {
                for (var i = 0; i < type.allowContent.length; i++) {
                    while (val.indexOf(type.allowContent[i]) > -1) {
                        val = val.replace(type.allowContent[i], "");
                    }
                }
            }
            if (isNaN(parseFloat(options.value)) && !isFinite(options.value)) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is not a number");
            }
        }

        //validate with the explicit regular expression
        if (type.value === 'regexp' && type.expr && !isEmpty) {
            if (!type.expr.test(options.value)) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is incorrect");
            }
        }

        //validate for alphanumeric characters
        if (type.value === 'alphanumeric' && !isEmpty) {
            var val = options.value;
            if (type.allowContent) {
                for (var i = 0; i < type.allowContent.length; i++) {
                    while (val.indexOf(type.allowContent[i]) > -1) {
                        val = val.replace(type.allowContent[i], "");
                    }
                }
            }
            if (!(/^[a-z0-9]+$/i.test(val))) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is not alphanumeric");
            }
        }

        //validate for email
        if (type.value === 'email' && !isEmpty) {
            if (!(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(options.value))) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is not an email");
            }
        }

        //validate for url
        if (type.value === 'url' && !isEmpty) {
            if (!(/^(ftp:\/\/|http:\/\/|https:\/\/)?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-\/]))?$/.test(options.value))) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is not a url");
            }
        }

        return new this.ValidationResult(true);
    }
};