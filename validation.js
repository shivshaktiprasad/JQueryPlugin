(function ($) {
    //$("[validate]").parentsUntil('[validation-option]').each(function () {
    //var options = JSON.parse($(this).attr('[validation-option]'));
    //if (options.onchange) {
    $(document).ready(function () {
        $("[validate]").focusout(validate);
        //$('[validate]').on("validation.validated", Validation.OverlayMessage);
    });
    //}
    //});
    $.fn.validate = function () {
        var output = { isValid: true, message: "", results: [] };
        var res = $(this).data('ValidationResult');
        if (!res) {
            res = validate({ Element: this });
        }
        Validation.ValidationResultToOutput(res, output);
        delete res;
        this.each(function () {
            $(this).find("[validate]").each(function () {
                var res = $(this).data('ValidationResult');
                if (!res) {
                    res = validate({ Element: this });
                }
                Validation.ValidationResultToOutput(res, output);
                delete res;
            });
        });
        return output;
    };
    $.fn.validation = function (options) {
        if (options) {
            this.each(function () {
                var validationOption = $(this).data("ValidationOption");
                validationOption = validationOption ? validationOption : {};
                for (var option in options) {
                    validationOption[option] = options[option];
                }
                $(this).data("ValidationOption", validationOption);
            });
            return this;
        } else {
            return $(this).data("ValidationOption");
        }
    };

    $.fn.clearValidationResult = function () {
        $(this).removeData("ValidationResult");
        Validation.OverlayMessage(this);
        this.each(function () {
            $(this).find('[validate]').each(function () {
                $(this).removeData("ValidationResult");
                Validation.OverlayMessage(this);
            });
        });
    }
    //$.fn.getPosition = function () {
    //    this
    //}
    function validate(opts) {
        var Element = 'object' === typeof opts ? opts.Element ? opts.Element : this : this,
            options = $(Element).attr("validate"),
            caption = $(Element).attr('caption'),
            value = $(Element).val();
        if (options) {
            options = eval('options={' + options + '}');
            var validationOption = $(Element).data("ValidationOption");
            if (validationOption) {
                $.extend(true, options, validationOption);
            }
            $(Element).data("ValidationOption", options);
            caption = caption ? caption : options.caption;
            var res = Validation.validate(Element, caption, value, options);
            Validation.OverlayMessage(Element, res);
            return res;
        } else { return { isValid: true }; }
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
        updateValidationOption: function (el, res) {
            var opts = $(el).data("ValidationResult");
            $.extend(opts, res);
            $(el).data("ValidationResult", opts);
        },
        extendValidationResult: function (el, res, computeIsValid) {
            var VR = $(el).data("ValidationResult");
            VR = VR ? VR : {};
            $.extend(true, VR, res);
            $(el).data("ValidationResult", VR);
        },
        ValidationResultToOutput: function (res, output) {
            for (var eachRes in res) {
                if (eachRes === "isValid" || eachRes === "errMessage") {
                    if (res.isValid === false) {
                        output.message += res.errMessage + "\n";
                        output.isValid = false;
                        $(output.results).append({ isValid: res.isValid, message: res.errMessage });
                    }
                    break;
                } else if ("object" === typeof res[eachRes]) {
                    this.ValidationResultToOutput(res[eachRes], output);
                }
            }
        },
        evalIsValid: function (res) {
            if (!res) return true;
            var isValid = true;
            for (var eachRes in res) {
                if("object" === typeof res[eachRes]){
                    isValid = this.evalIsValid(res[eachRes]) === false ? false : isValid;
                    if (!isValid) break;
                } else if (eachRes === "isValid" || eachRes === "errMessage") {
                    isValid = "boolean" === typeof res.isValid ? res.isValid : true;
                    break;
                }
            }
            return isValid;
        },
        evalRes: function (res) {
            var ret = "";
            for (var eachRes in res) {
                if (eachRes === "isValid" || eachRes === "errMessage") {
                    ret += res.isValid ? "" : ('<li>' + res.errMessage + '</li>');
                    break;
                } else if ("object" === typeof res[eachRes]) {
                    var inner = this.evalRes(res[eachRes]);
                    ret += (inner === "" ? "" : ('<ul>' + inner + '</ul>'));
                }
            }
            return ret;
        },
        //evalRes: function (res) {
        //    var ret = "";
        //    if (!res.isValid) {
        //        for (var eachRes in res) {
        //            if ("string" === typeof res[eachRes]) {
        //                return "<li>" + res[eachRes] + "</li>";
        //            } else if ("object" === typeof res[eachRes]) {
        //                var inner = this.evalRes(res[eachRes]);
        //                ret += (inner === "" ? "" : ('<ul>' + inner + '</ul>'));
        //            }
        //        }
        //    } else { ret += "" }
        //    return ret;
        //},
        OverlayMessage: function (el, res) {
            var inlineStyle = $(el).attr("inValidStyle"),
                style = $(el).data("ValidationStyle"),
                orgnlStyle = $(el).attr("style"),
                splt = [],
                spltEach = [],
                vldsnRes = res ? res : $(el).data("ValidationResult"),
                overLay,
                pos = {};
            overLay = $(el).next('div.ValidationResult');
            overLay = overLay.length > 0 ? overLay[0] : document.createElement("div");
            // Evaluate Validation Style
            $.extend(true, inlineStyle, style); style = inlineStyle; delete inlineStyle;
            $(el).data("ValidationStyle", style);
            if (orgnlStyle !== undefined && orgnlStyle !== "") {
                splt = orgnlStyle.split(";");
                orgnlStyle = {};
                for (var index = 0; index < splt.length; index++) {
                    if (splt[index] !== "") {
                        spltEach = splt[index].split(":");
                        orgnlStyle[spltEach[0]] = spltEach[1];
                    }
                }
                $(el).data("OriginalStyle", orgnlStyle);
            }

            //Evaluate ValidationResult messages
            if (!this.evalIsValid(vldsnRes)) {
                vldsnRes = this.evalRes(vldsnRes);
                pos = $(el).position();
                $(overLay).addClass("ValidationResult").css(style ? style : {}).html(vldsnRes).append('<div class="anchor"></div>').insertAfter(el);
                // offset.top -= $(el).height();
                pos.top -= $(el).next('div.ValidationResult').height() + 11;
                $(el).next('div.ValidationResult').css({ top: pos.top, left: pos.left });
            } else {
                $(el).next("div.ValidationResult").remove();
            }
        },
        validate: function (Element, caption, value, options) {
            var isEmpty = (value === undefined ? true : value === "" ? true : false),
                res = {},//{ isValid: true },
            validators = {
                // validate from a url. The url sends the Json response as true or false.
                url: function (el, cap, val, opt) {
                    var sendVal = val,
                        res = { isValid: false, errMessage: 'processing..' };
                    if (!isEmpty) {
                        if ("object" == typeof opt) {
                            opt.errMessage = opt.errMessage ? opt.errMessage : ("the value provided in " + cap + " cannot be accepted.");
                            if ("object" == typeof opt.params) {
                                sendVal = opt.params;
                                sendVal.value = val;
                            }
                        }
                        else {
                            opt.url = opt;
                            opt.errMessage = "the value provided in " + cap + " cannot be accepted.";
                        }
                        //Validation.extendValidationResult(el, { url: res, isValid: res.isValid });
                        $.ajax({
                            type: "post",
                            contentType: "application/json; charset=utf-8",
                            url: opt.url,
                            data: JSON.stringify({ value: sendVal }),
                            dataType: "json",
                            async: true,
                            success: function (data, textStatus) {
                                var ret = JSON.parse(data.d);
                                res = ("boolean" === typeof ret ?
                                        { isValid: ret, errMessage: (ret ? "" : opt.errMessage) } :
                                        { isValid: false, errMessage: "incorrect server response" });
                                Validation.extendValidationResult(el, { url: res });
                                Validation.OverlayMessage(el);
                            },
                            error: function () {
                                res = { isValid: false, message: 'could not validate ' + cap + ' due to network error.' };
                                Validation.extendValidationResult(el, { url: res });
                                Validation.OverlayMessage(el);
                            }
                        });
                    } else {
                        res = { isValid: true };
                    }
                    return res;
                },
                //validate for mandatory
                required: function (el, cap, val, opt) {
                    var res = { isValid: true };
                    if (val === undefined) {
                        res.isValid = false;
                        res.errMessage = cap + " is required";
                    }
                    if ('object' == typeof val) {
                        res.isValid = false;
                        res.errMessage = cap + " is required";
                    }
                    if ('string' == typeof val && val == "") {
                        res.isValid = false;
                        res.errMessage = cap + " is required";
                    }
                    //$(el).data("ValidationResult", { required: res });
                    return res;
                },
                //validate for minimum length of string
                minLength: function (el, cap, val, opt) {
                    var curOpt = "object" === typeof opt? opt: {value:opt},
                        res = { isValid: true };
                    if (!isEmpty && val.length < curOpt.value) {
                        res.isValid = false;
                        res.errMessage = curOpt.errMessage ? curOpt.errMessage : (cap + " is less than minimum length of " + curOpt.value + " characters");
                    }
                    //$(el).data("ValidationResult", { minLength: res });
                    return res;
                },
                //validate for maximum length of string
                maxLength: function (el, cap, val, opt) {
                    var curOpt = "object" === typeof opt? opt : {value:opt},
                        res = { isValid: true };
                    if (!isEmpty && val.length > curOpt.value) {
                        res.isValid = false;
                        res.errMessage = opt.errMessage ? opt.errMessage : (cap + " is greater than maximum length of " + curOpt.value + " characters");
                    }
                    //$(el).data("ValidationResult", { maxLength: res });
                    return res;
                },
                //validate the value in a valid list
                allow: function (el, cap, val, opt) {
                    var res = { isValid: true, errMessage: "" },
                        valid = false;
                    if (!isEmpty) {
                        for (var index = 0; index < opt.length; index++) {
                            if (opt[index] == val) {
                                valid = true;
                                break;
                            }
                        }
                    } else {
                        valid = true;
                    }
                    if (!valid) {
                        res.isValid = false;
                        res.errMessage = cap + " is not in the valid list";
                    }
                    //$(el).data("ValidationResult", { allow: res });
                    return res;
                },
                //validate the valuse not in the invalid list
                notAllow: function (el, cap, val, opt) {
                    var res = { isValid: true, errMessage: "" },
                        valid = true;
                    for (var index = 0; index < opt.length; index++) {
                        if (opt[index] == val) {
                            valid = false;
                            break;
                        }
                    }
                    if (!valid) {
                        res.isValid = false;
                        res.errMessage = cap + " is in the invalid list";
                    }
                    //$(el).data("ValidationResult", { notAllow: res });
                    return res;
                },
                /*
                typed validations. a valid type defination can be 
                    string, 
                    {
                        value:'string, function', 
                        errMessage:'string', 
                        expr:'regular-expression when value is regexp',
                        allowContent: 'array of allowed contents',
                        notAllowContent: 'array of not allowed contents'
                    }
                */
                type: function (el, cap, val, opt) {
                    var res = { },
                        type = {
                        //validate for number type
                        number: function (el, cap, val, opt) {
                            var options = {
                                type: function (el, cap, val, opt) {
                                    var types = {
                                        natural: function (el, cap, val, opt) {
                                            var res = { isValid: true };
                                            if (!isEmpty) {
                                                if (Math.abs((val * 10) % 10) === 0) {
                                                    res = (val > 0 ? res : { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not a Natural Number.") });
                                                } else {
                                                    res = { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not a Natural Number.") }
                                                }
                                            }
                                            return res;
                                        },
                                        whole: function (el, cap, val, opt) {
                                            var res = { isValid: true };
                                            if (!isEmpty) {
                                                if (Math.abs((val * 10) % 10) === 0) {
                                                    res = (val >= 0 ? res : { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not a Whole Number.") });
                                                } else {
                                                    res = { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not a Whole Number.") }
                                                }
                                            }
                                            return res;
                                        },
                                        integer: function (el, cap, val, opt) {
                                            var res = { isValid: true };
                                            if (!isEmpty) {
                                                if (Math.abs((val * 10) % 10) !== 0) {
                                                    res = { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not an Integer.") };
                                                }
                                            }
                                            return res;
                                        }
                                    };
                                    opt = ("object" === typeof opt ? opt : { value: opt });
                                    var res = (types[opt.value] ? types[opt.value](el, cap, val, opt) : undefined);
                                    //Validation.extendValidationResult(el, { type: { type: res } });
                                    return res;
                                },
                                maxVal: function (el, cap, val, opt) {
                                    var res = { isValid: true };
                                    if (!isEmpty) {
                                        res = (val < opt ? res : { isValid: false, errMessage: (cap + " is greater that " + opt + ".") });
                                    }
                                    //Validation.extendValidationResult(el, { type: { maxVal: res } });
                                    return res;
                                },
                                minVal: function (el, cap, val, opt) {
                                    var res = { isValid: true };
                                    if (!isEmpty) {
                                        res = (val >= opt ? res : { isValid: false, errMessage: (cap + " is less that " + opt + ".") });
                                    }
                                    //Validation.extendValidationResult(el, { type: { minVal: res } });
                                    return res;
                                }
                            },
                            res = { },
                            tempVal = val;

                            if (opt.allowContent) {
                                for (var i = 0; i < opt.allowContent.length; i++) {
                                    while (tempVal.indexOf(opt.allowContent[i]) > -1) {
                                        tempVal = tempVal.replace(opt.allowContent[i], "");
                                    }
                                }
                            }
                            if (tempVal !== "" && isNaN(tempVal) && !isFinite(tempVal)) {
                                res["number"] = { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not a rational number") };
                                //Validation.extendValidationResult(el, { type: res });
                                return res;
                            } else {
                                res["number"] = { isValid: true, errMessage: "" };
                            }
                            for (var option in opt) {
                                if ("function" === typeof options[option]) {
                                    res[option] = options[option](el, cap, tempVal, opt[option]);
                                    //res.isValid = res[option] ? res[option].isValid ? res.isValid : res[option].isValid : res.isValid;
                                }
                            }
                            return res;
                        },
                        //validate with the explicit regular expression
                        regexp: function (el, cap, val, opt) {
                            var res = { isValid: true };
                            if (!isEmpty && opt.expr) {
                                if (!type.expr.test(val)) {
                                    res = { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is incorrect") };
                                }
                            }
                            //Validation.extendValidationResult(el, { type: res });
                            return res;
                        },
                        //validate for alphanumeric characters type
                        alphanumeric: function (el, cap, val, opt) {
                            var res = { isValid: true },
                                tempVal = val;
                            if (!isEmpty) {
                                if (opt.allowContent) {
                                    for (var content in opt.allowContent) {
                                        while (tempVal.indexOf(opt.allowContent[content]) > -1) {
                                            tempVal = tempVal.replace(opt.allowContent[content], "");
                                        }
                                    }
                                }
                                if (tempVal !== "" && !(/^[a-z0-9]+$/i.test(tempVal))) {
                                    res = { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not alphanumeric") };
                                }
                                //Validation.extendValidationResult(el, { type: res });
                            }
                            return res;
                        },
                        //validate for email type
                        email: function (el, cap, val, opt) {
                            var res = { isValid: true };
                            if (!isEmpty) {
                                if (!(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(val))) {
                                    res = { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not a valid email") };
                                }
                            }
                            //Validation.extendValidationResult(el, { type: res });
                            return res;
                        },
                        //validate for url type
                        url: function (el, cap, val, opt) {
                            var res = { isValid: true };
                            if (!isEmpty) {
                                if (!(/^(ftp:\/\/|http:\/\/|https:\/\/)?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-\/]))?$/.test(val))) {
                                    res = { isValid: false, errMessage: opt.errMessage ? opt.errMessage : (cap + " is not a url") };
                                }
                            }
                            //Validation.extendValidationResult(el, { type: res });
                        }
                    };
                    opt = ("object" === typeof opt ? opt : { value: opt });
                    if ("function" === typeof type[opt.value]) {
                        res = type[opt.value](el, cap, val, opt);
                        //res.isValid = res['type'] ? res['type'].isValid ? res.isValid : false : res.isValid;
                    }
                    return res;
                }
            };
            for (var name in options) {
                if ("function" === typeof validators[name]) {
                    res[name] = validators[name](Element, caption, value, options[name]);
                    //res.isValid = res[name] ? res[name].isValid ? res.isValid : false : res.isValid;
                }
            }
            Validation.extendValidationResult(Element, res);
            return res;
        }
    };
}(jQuery));