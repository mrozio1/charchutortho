// HP video Parallax - for traditional slideshow, change "welcomevid" to "home-slideshow" below on line 11 and 18
/*
function e(e, o) {
	var a = "translateY(" + o + "px";
	e.style["-webkit-transform"] = a,
	e.style.transform = a,
	e.style.willChange = "transform";
}

var o = function () {
	var o = document.getElementById("welcomevid"),
		a = window.scrollY / -2;
	e(o, a)
};

function paraV() {
	if (window.innerWidth > 1299) {
		$("#welcomevid").length > 0 && $(function () {
			requestAnimationFrame(function(){
				$(window).on("scroll", o);
			});	
		});
	}
}

paraV();
*/


$(window).on('resize',function() {
});

$(document).ready(function() {

	$(window).trigger('resize');

	//Back to top hide and animate
	//	if ($('#bd').height() > $(window).height()) {
	//		$('#backtotop').removeClass('hide');
	//	}
	/* $('#backToTop').removeClass('hide'); */
	
	$('#backtotop').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 'slow');
		return false;
	});
	$('.common-procedures a[href="#hd"]').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 'slow');
		return false;
	});	
	$('.faq-s a[href="#top"]').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 'slow');
		return false;
	});

	//hide subnav from 404pages	
	/*
	var subnav = $("#subnav");
	var error404 = $("h1:contains('Error 404')");
		if(error404) {	
		$("#subnav").css('display', 'none');
		};
	*/

//hide ip-sub if it contains only one item
if($("#subnav a").length == '1'){ 
$("#subnav h2, #subnav p").hide(); 
};            

   // Post Appointment Survey form "May We Contact You" toggle
        $("#Contact_Patient").change(function() {
            
            if ($(this).val() == 'Yes') {
                // not current patient, ask where they found us
                $('#survey_participant').fadeIn('slow', function() {
                    $(this).find('input').removeAttr('disabled').attr('required','required');
                });
            } else { 
                // current patient, hide content
                $('#survey_participant').fadeOut('fast',function() {
                    $(this).find('input').attr('disabled','disabled').removeAttr('required');
                });
            }
        });
    
        // Appointment Request form "Referred by patient" toggle
        $("#Referred_By_Current_Patient").change(function() {
            
            if ($(this).val() == 'Yes') {
                // not current patient, ask where they found us
                $('#referred_by_patient').fadeIn('slow', function() {
                    $(this).find('input').removeAttr('disabled').attr('required','required');
                });
            } else {
                // current patient, hide content
                $('#referred_by_patient').fadeOut('fast',function() {
                    $(this).find('input').attr('disabled','disabled').removeAttr('required');
                });
            }
        });

        // Referral form "Radiographs Sent" toggle
        $("input[name^='sc_form[Radiographs_Sent]']").on('click', function() {
             if ($("input[name^='sc_form[Radiographs_Sent]']:checked").val() == 'Yes') {
                // not current patient, ask where they found us
                $('.hidden-option').fadeIn('slow', function() {
                    $(this).find('input').removeAttr('disabled').attr('required','required');
                });
            } else {
                // current patient, hide content
                $('.hidden-option').fadeOut('fast',function() {
                    $(this).find('input').attr('disabled','disabled').removeAttr('required');
                });
            }
        });
		
		
 /* add class to email */
 var $emailLinks = $('a.email');
        
	//if ($emailLinks.length < 1) {return;} // skip this function if no objects found       
		// Insert empty <a> tag with the following attributes:
		// * class="email"
		// * rel="example|domain.com" where pipe char '|' replaces '@'
		// * title="Email Us", this is the text shown after the email link is created by js                 
		$emailLinks.addClass('addicon').emailProt();
		
// Open external links in new windows
var domainName = window.location.hostname;
$('a[href^="http://"], a[href^="https://"]').not('a[href$=".doc"], a[href$=".pdf"], a[href*="' + domainName + '"]').addClass('external').attr({target: '_blank', rel: 'noopener noreferrer'});

		
}); // end doc ready