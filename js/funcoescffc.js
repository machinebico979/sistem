/**
 * ScrollTo
 * @param {type} el
 * @param {type} speed
 * @returns {undefined}
 */
function scrollTo(el, speed) {
    if (speed == null) {
        speed = 500;
    }
    var posicaoAjuste = -40;
    if ($('.isMobile').length > 0) {
        //ajuste para o mobile
        posicaoAjuste = -70;
    }
    //$('body').scrollTo(el, speed);
    $('html, body').animate({scrollTop: (el.offset().top + posicaoAjuste)}, speed);
}

function buttonLoading(button, show, msg) {
    if(show) {
        if(!msg || msg.length == 0) {
            msg = 'Processando';
        }
        button.data('msg', button.text()).html('<i class="fas fa-spinner fa-spin"></i> ' + msg);
        button.prop('disabled', true);
    } else {
        button.html(button.data('msg'));
        button.prop('disabled', false);
    }
}

/**
 * recaptchaPromise
 * @param {type} objForm
 * @param {type} action e.g: 'index_salvar_contato'
 * @returns {Promise}
 */
function recaptchaPromise(objForm, action) {
    return new Promise((resolve, reject) => {
        if (typeof grecaptcha != "undefined" && typeof recaptchaSiteKey != "undefined") {
            grecaptcha.ready(function() {
                jQuery('.grecaptcha-badge').appendTo("#grecaptcha-box");
                grecaptcha.execute(recaptchaSiteKey, {action: action}).then(function(token) {
                    if(objForm.find('[name="g-recaptcha-response"]').length == 0) {
                        objForm.prepend(`<input type="hidden" name="g-recaptcha-response">`);
                    }
                    objForm.find('[name="g-recaptcha-response"]').val(token);
                    
                    resolve(token);
                }, function (reason) {
                    console.log(reason);
                    reject('Não foi possível verificar o captcha. Tente novamente em instantes.');
                });
            });
        } else {
            resolve('');
        }
    });
}

function acoesLogin(formLogin, callback, action_name = null) {
    var inputLogin = formLogin.find(".js_loginEmail");
    var btEntrar = formLogin.find(".js_loginEntrar");
    var btEntrarTxt = btEntrar.html();
    var btSair = $("#box-logado .js_loginSair");
    var btEsqueceuSenha = formLogin.find(".js_esqueceuSenha");
    var boxErro = formLogin.find(".js_warningMsg");
    var boxSuccess = formLogin.find(".js_successMsg");
    var processandoRequisicao = formLogin.find(".js_processandoRequisicao");
    var msgErro = 'Não foi possível realizar o login.<br/>Tente novamente em instantes.';
    action_name = action_name || 'areacliente_login';

    formLogin.find('[data-toggle="password"]').each(function () {
        var input = $(this);
        var eye_btn = $(this).parent().find('.input-group-text');
        eye_btn.css('cursor', 'pointer').addClass('input-password-hide');
        eye_btn.on('click', function () {
            if (eye_btn.hasClass('input-password-hide')) {
                eye_btn.removeClass('input-password-hide').addClass('input-password-show');
                eye_btn.find('.far').removeClass('fa-eye').addClass('fa-eye-slash');
                input.attr('type', 'text');
            } else {
                eye_btn.removeClass('input-password-show').addClass('input-password-hide');
                eye_btn.find('.far').removeClass('fa-eye-slash').addClass('fa-eye');
                input.attr('type', 'password');
            }
        });
    });

    $('.dropdown-menu.keepOpen').on('click', function (e) {
        e.stopPropagation();
    });

    formLogin.validate({
        errorLabelContainer: boxErro,
        errorElement: "div",
        submitHandler: function () {
            formLogin.find(".validate-msg").html('').hide();
            recaptchaPromise(formLogin, action_name).then((token) => {
                formLogin.ajaxSubmit({
                    beforeSend: function () {
                        formLogin.find(".validate-msg").html('').hide();
                        processandoRequisicao.val(1);
                        btEntrar.html('<i class="fas fa-spinner fa-spin"></i> Processando...');
                    },
                    error: function () {
                        boxErro.html(msgErro).show();
                    },
                    dataType: "json",
                    success: function (data) {
                        if(!data || data.erro != 0) {
                            var msg = (data && data.msg ? data.msg : '') || msgErro;
                            boxErro.html(msg).show();
                            return;
                        }
                        if (typeof callback == 'function') {
                            callback(data);
                        }
                    },
                    complete: function(){
                        processandoRequisicao.val(0);
                        btEntrar.html(btEntrarTxt);
                    }
                });
            }).catch((msg) => {
                formLogin.find("#error-msg").html(msg).show();
                scrollTo(formLogin.find('.js_validate-msg'), 500);
            });
        }
    });

    btEsqueceuSenha.click(function (e) {
        e.preventDefault();
        formLogin.find(".validate-msg").html('').hide();

        if (inputLogin.val().length == 0) {
            boxErro.html(inputLogin.attr("title")).show();
            inputLogin.focus();
            return;
        }

        boxErro.html("Enviando e-mail para <br/>" + inputLogin.val()).show();
        btEsqueceuSenha.hide();
        btEntrar.html('<i class="fas fa-spinner fa-spin"></i> Processando...');

        $.post(btEsqueceuSenha.attr('href'), {
            email: inputLogin.val()
        }, function (data) {
            formLogin.find(".validate-msg").html('').hide();
            btEsqueceuSenha.show();
            btEntrar.html(btEntrarTxt);
            
            if (data.erro == 0) {
                boxSuccess.html("Recuperação de senha enviada para<br/>" + data.destinatario).show();
            } else {
                boxErro.html(data.msg).show();
            }
        }, 'json');
    });

    formLogin.on("click", ".js_reenviarConfirmacao", function (e) {
        e.preventDefault();
        var btReenviarConfirmacao = $(this);
        formLogin.find(".validate-msg").html('').hide();

        if (inputLogin.val().length == 0) {
            boxErro.html(inputLogin.attr("title")).show();
            inputLogin.focus();
            return;
        }
        
        btEntrar.html('<i class="fas fa-spinner fa-spin"></i> Processando...');
        boxErro.html("Enviando para " + inputLogin.val()).show();
        
        $.post(btReenviarConfirmacao.attr('href'), {
            email: inputLogin.val()
        }, function (data) {
            formLogin.find(".validate-msg").html('').hide();
            btEntrar.html(btEntrarTxt);

            if (data.erro == 0) {
                boxSuccess.html("Confirmação de cadastro enviado para<br/>" + data.destinatario).show();
            } else {
                boxErro.html("E-mail " + data.destinatario + " não está cadastrado").show();
            }
        }, 'json');
    });

    btSair.click(function () {
        $.post(baseUrl + 'logout', function (data) {
            if (data.erro == 0) {
                $("#box-logado").hide();
                $('.tb-lances-usuario').find('table > tbody').html('<tr><td colspan="4" align="center">Faça o login</td></tr>');
                $("#TMP_2").val('');
                location.reload();
            } else {
                boxErro.html(data.msg).show();
            }
            processandoRequisicao.val(0);
        }, 'json');
    });
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '')
        return false;

    if (cpf.length != 11 ||
            cpf == "00000000000" ||
            cpf == "11111111111" ||
            cpf == "22222222222" ||
            cpf == "33333333333" ||
            cpf == "44444444444" ||
            cpf == "55555555555" ||
            cpf == "66666666666" ||
            cpf == "77777777777" ||
            cpf == "88888888888" ||
            cpf == "99999999999")
        return false;

    //valida primeiro digito 
    add = 0;
    for (i = 0; i < 9; i ++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return false;
    //valida segundo digito 
    add = 0;
    for (i = 0; i < 10; i ++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return false;
    return true;
}

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj == '')
        return false;

    if (cnpj.length != 14)
        return false;

    if (cnpj == "00000000000000" ||
            cnpj == "11111111111111" ||
            cnpj == "22222222222222" ||
            cnpj == "33333333333333" ||
            cnpj == "44444444444444" ||
            cnpj == "55555555555555" ||
            cnpj == "66666666666666" ||
            cnpj == "77777777777777" ||
            cnpj == "88888888888888" ||
            cnpj == "99999999999999")
        return false;

    //valida DVs
    tamanho = cnpj.length - 2;
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
        return false;

    return true;
}

/**
 * Obtem a informacao do ano de fabricacao e modelo do lote no formato "[{Label}: ]{fab}[/{mod}]
 * @param {object} lote Objeto contendo o ano fab. e/ou ano mod.
 * @param {boolean} label Indica se deve retornar o label também. Default false
 * @returns {String}
 */
function getAnoFabMod(lote, label) {
    if (!lote) {
        return '';
    }
    
    var $anoMod = (typeof (lote.VEI_ANOMOD) != 'undefined' && lote.VEI_ANOMOD != null && lote.VEI_ANOMOD != '') ? lote.VEI_ANOMOD : null;
    var $anoFab = (typeof (lote.VEI_ANOFAB) != 'undefined' && lote.VEI_ANOFAB != null && lote.VEI_ANOFAB != '') ? lote.VEI_ANOFAB : null;
    if ($anoMod || $anoFab) {
        var $anoLabel = '';
        var $anoValor = '';
        if ($anoMod && $anoFab) {
            $anoLabel = 'Ano Fab./Modelo: ';
            $anoValor = $anoFab + '/' + $anoMod;
        } else if ($anoMod) {
            $anoLabel = 'Ano Modelo: ';
            $anoValor = $anoMod;
        } else if ($anoFab) {
            $anoLabel = 'Ano: ';
            $anoValor = $anoFab;
        }
        if(label === true) {
            return $anoLabel + $anoValor;
        }
        return $anoValor;
    }
    return '';
}

function getEstadoConservacaoNome(lote) {
    if (typeof lote.VEC_NOME != 'undefined' && lote.VEC_NOME != null) {
        return lote.VEC_NOME;
    }
    if (estadoConservacaoLista) {
        if (lote.LEL_GRUPO == true) {
            if(typeof lote.VEC_ID_LISTA != 'undefined' && lote.VEC_ID_LISTA != null) {
                var arr = lote.VEC_ID_LISTA.replaceAll('(', '').replaceAll(')', '').split(',');
                var lista = '';
                $.each(arr, function (key, item) {
                    if(lista !== '') {
                        lista += ', ';
                    }
                    lista += estadoConservacaoLista[item].VEC_NOME;
                });
                return lista;
            }
        } else if (typeof lote.VEC_ID != 'undefined' && lote.VEC_ID != null) {
            return estadoConservacaoLista[lote.VEC_ID].VEC_NOME;
        }
    }
    return '';
}

/**
 * getValorTaxaAdm
 * @param {type} $valorTaxaAdm
 * @param {type} $taxaAdmPercent
 * @param {type} $valorLance
 * @param {type} $output null || 'txt'
 * @returns {String|@var;valorDepositoPercentLance}
 */
function getValorTaxaAdm($valorTaxaAdm, $taxaAdmPercent, $valorLance, $output) {
    if($output === 'txt') {
        return getTextoTaxaAdm($valorTaxaAdm, $taxaAdmPercent);
    }
    
    $valorLance = $valorLance || 0;
    
    if ($taxaAdmPercent > 0) {
        var $valorTaxaAdmPercentLance = new Number(($taxaAdmPercent / 100) * $valorLance);
        if($valorTaxaAdmPercentLance > 0 && ($valorTaxaAdm <= 0 || $valorTaxaAdmPercentLance < $valorTaxaAdm)) {
            $valorTaxaAdm = $valorTaxaAdmPercentLance;
        }
    }
    
    return $valorTaxaAdm;
}

/**
 * getTextoTaxaAdm
 * @param {type} $valorTaxaAdm
 * @param {type} $taxaAdmPercent
 * @returns {String}
 */
function getTextoTaxaAdm($valorTaxaAdm, $taxaAdmPercent) {
    var $txtValorTaxaAdm = 'R$ ' + numberToMoeda($valorTaxaAdm.toFixed(2).toString());
    
    if ($taxaAdmPercent > 0) {
        $txtValorTaxaAdm = numberToMoeda($taxaAdmPercent.toFixed(2).toString()) + '% do Lance.';
        if($valorTaxaAdm > 0) {
            $txtValorTaxaAdm += '<br/>Valor máximo: ' + 'R$ ' + numberToMoeda($valorTaxaAdm.toFixed(2).toString()) + '.';
        }
    }
    
    return $txtValorTaxaAdm;
}

function avisoBrowserNotFirefox() {
    var navegador = detectBrowser();
    $('#avisoBrowserNotFirefox').hide();
    if (navegador != "firefox") {
        $('#avisoBrowserNotFirefox').show();
    }
}

function detectBrowser() {
    var userAgent = navigator.userAgent.toLowerCase();
    $.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
    var version = 0;
    var navegador = "";
    // IE?
    if ($.browser.msie) {
        navegador = "ie";
    }
    // Chrome?
    if ($.browser.chrome) {
        $.browser.safari = false;
        navegador = "chrome";
    }
    // Safari?
    if ($.browser.safari) {
        navegador = "safari";
    }
    // Mozilla?
    if ($.browser.mozilla) {
        //Is it Firefox?
        if (navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
            navegador = "firefox";
        }
        // If not then it must be another Mozilla
        else {
            navegador = "mozilla";
        }
    }
    // Opera?
    if ($.browser.opera) {
        navegador = "opera";
    }
    return navegador;
}

function getVideoIframeID(url, type) {
    var videoID = "";
    var regex;
    if (type === 'youtube') {
        regex = /(?:\/embed\/|\/watch\?v=|\/\?v=|youtu\.be\/)([^&?/]+)/;
    } else if (type === 'vimeo') {
        regex = /\/(\d+)$/;
    }
    var match = url.match(regex);
    if (match) {
        videoID = match[1];
    }
    return videoID;
}

function createVideoIframe(src, options) {
    var iframe = document.createElement("iframe");
    iframe.width = options && options.width ? options.width : "100%";
    iframe.height = options && options.height ? options.height : "100%";
    iframe.src = src;
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    return iframe;
}
