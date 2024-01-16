/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: PT (Portuguese; português)
 * Region: BR (Brazil)
 */
jQuery.extend(jQuery.validator.messages, {
	required: "Este campo &eacute; requerido.",
	remote: "Por favor, corrija este campo.",
	email: "Informe um endere&ccedil;o eletr&ocirc;nico v&aacute;lido.",
	url: "Informe uma URL v&aacute;lida.",
	date: "Informe uma data v&aacute;lida.",
	dateISO: "Informe uma data v&aacute;lida (ISO).",
	number: "Informe um n&uacute;mero v&aacute;lido.",
	digits: "Informe somente d&iacute;gitos.",
	creditcard: "Informe um cart&atilde;o de cr&eacute;dito v&aacute;lido.",
	equalTo: "Informe o mesmo valor novamente.",
	accept: "Informe um valor com uma extens&atilde;o v&aacute;lida.",
	maxlength: jQuery.validator.format("Informe n&atilde;o mais que {0} caracteres."),
	minlength: jQuery.validator.format("Informe ao menos {0} caracteres."),
	rangelength: jQuery.validator.format("Informe um valor entre {0} e {1} caracteres de comprimento."),
	range: jQuery.validator.format("Informe um valor entre {0} e {1}."),
	max: jQuery.validator.format("Informe um valor menor ou igual a {0}."),
	min: jQuery.validator.format("Informe um valor maior ou igual a {0}.")
});

jQuery.validator.addMethod("datePTBR", function(value) { 
  return this.optional(element) || /^\d\d?\/\d\d?\/\d\d\d?\d?$/.test(value); 
}, "Informe uma data v&aacute;lida.");


jQuery.validator.addMethod(
  "dateBR",
  function(value, element) {
        var val_exp=value.split('/');
        if(val_exp.length==3){
      var ano=val_exp[2];
      var mes=val_exp[1];
      var dia=val_exp[0];
      if((ano>=1000)&&(ano<10000)){
        if(((mes=='01')||(mes=='03')||(mes=='05')||(mes=='07')||(mes=='08')||(mes=='10')||(mes=='12'))&&(dia.match(/^(0[1-9]|[1-2][0-9]|3[0-1])$/))){
          return true;
        }else if(((mes=='04')||(mes=='06')||(mes=='09')||(mes=='07')||(mes=='08')||(mes=='11'))&&(dia.match(/^(0[1-9]|[1-2][0-9]|30)$/))){
          return true;
        }else if((mes=='02')&&(dia.match(/^(0[1-9]|1[0-9]|2[0-8])$/))){
          return true;
        }else if((mes=='02')&&(dia=='29')&&((ano%400==0)||((ano%4==0)&&(ano%100!=0)))){
          return true;
        }else{
          if(jQuery(element).val().length==0) return true; else return false;
        }
      }else{
        if(jQuery(element).val().length==0) return true; else return false;
      }
    }else{
      if(jQuery(element).val().length==0) return true; else return false;
    }
  },
  "Data inválida"
);
jQuery.validator.addMethod(
  "dateBRMesAno",
  function(value, element) {
        var val_exp=value.split('/');
        if(val_exp.length==2){
      var ano=val_exp[1];
      var mes=val_exp[0];
      if((ano>=11)&&(ano<30)){
        if(((mes=='01')||(mes=='02')||(mes=='03')||(mes=='05')||(mes=='07')||(mes=='08')||(mes=='10')||(mes=='12'))){
          return true;
        }else if(((mes=='04')||(mes=='06')||(mes=='09')||(mes=='07')||(mes=='08')||(mes=='11'))){
          return true;
        } else{
          if(jQuery(element).val().length==0) return true; else return false;
        }
      }else{
        if(jQuery(element).val().length==0) return true; else return false;
      }
    }else{
      if(jQuery(element).val().length==0) return true; else return false;
    }
  },
  "Data inválida"
);
