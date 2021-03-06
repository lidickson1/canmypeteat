let foods;
const url =
    "http://canmypeteat-env.eba-3jdfr74b.us-east-2.elasticbeanstalk.com/";

function reset() {
    $("#food_info:visible").toggle("slow");
    clearSearch();
}

$(document).ready(function () {
    $("#disclaimer").modal({ dismissible: false });
    $("#disclaimer").modal("open");

    reset();

    $.ajax({
        url: url + "connect",
        type: "POST",
        success: function (data) {
            console.log(data);
        },
    });
});

function getPet() {
    //TODO: Select Pet is when no pet is selected
    if ($("#pets_dropdown").text() === "Select Pet") {
        return null;
    } else {
        //all pet names must be in the format of "{emoji} {pet name}"
        return $("#pets_dropdown").text().split(" ")[1].toLowerCase();
    }
}

function clearSearch() {
    $("#search").val("").removeClass("valid");
    M.updateTextFields();
}

$("#search_clear").click(function () {
    clearSearch();
});

//cancel enter key refreshing the page
$("#search").keypress(function (e) {
    if (e.which === 13) {
        e.preventDefault();
    }
});

$("#pets_dropdown").dropdown();

const fadeTime = 300;
$(".pet").click(function () {
    $("#pets_dropdown").text($(this).text());
    reset();
    $("#search_box:hidden").toggle("slow");
    $.ajax({
        url: url + "get",
        type: "POST",
        data: getPet(),
        contentType: "text/plain",
        success: function (list) {
            foods = {};
            let autocomplete_options = {};
            for (let i = 0; i < list.length; i++) {
                foods[list[i].name] = list[i];
                autocomplete_options[list[i].name] = null;
            }
            $(".autocomplete").autocomplete({
                data: autocomplete_options,
                //when autocomplete option is clicked
                onAutocomplete: function (item) {
                    let food = foods[item];
                    let eat = food.pets[getPet()].eat;
                    //console.log(eat);
                    $("#food_info:hidden").toggle("slow");

                    let color;
                    if (eat === 1) {
                        color = "#00c853";
                    } else if (eat === 0) {
                        color = "#f9a825";
                    } else if (eat === -1) {
                        color = "#f44336";
                    }
                    //can't use css because I need to set the important flag (because of materialize)
                    $("#food_info").attr(
                        "style",
                        "background-color: " + color + " !important;"
                    );

                    let yesNo;
                    if (eat === 1) {
                        yesNo = "YES";
                    } else if (eat === 0) {
                        yesNo = "WITH CAUTION";
                    } else if (eat === -1) {
                        yesNo = "NO";
                    }
                    $("#yes_no")
                        .fadeOut(fadeTime, function () {
                            $(this).text(yesNo);
                        })
                        .fadeIn(fadeTime);
                    $("#food_header")
                        .fadeOut(fadeTime, function () {
                            $(this).text(
                                "Your " +
                                    getPet() +
                                    " " +
                                    (eat > -1 ? "can" : "cannot") +
                                    " eat " +
                                    food.plural +
                                    "!"
                            );
                        })
                        .fadeIn(fadeTime);
                    $("#food_image")
                        .fadeOut(fadeTime, function () {
                            $(this).attr("src", food.image);
                        })
                        .fadeIn(fadeTime);
                    //$("#food_image").attr("src", );
                    $("#description")
                        .fadeOut(fadeTime, function () {
                            $(this).text(food.pets[getPet()].description);
                        })
                        .fadeIn(fadeTime);
                    //need to call off because it somehow remembers previously set links
                    $("#source")
                        .off()
                        .click(function () {
                            window.open(food.pets[getPet()].source);
                        });
                },
            });
        },
    });
});
