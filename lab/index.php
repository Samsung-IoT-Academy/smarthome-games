<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Виртуальная лаборатория</title>
    <script src="js/jquery.js"></script>
    <style type="text/css">
        .house IMG { position: relative; }
        .house DIV { position: relative; }
        .house DIV INPUT{ position: relative; width: 100px; }
        .house DIV P{ position: relative; }

        </style>
    <link rel="stylesheet" href="css/range.css">
    <script src="js/mqttws31.min.js"></script>

</head>

<body>

<div class="house">
<img src="img/house.png" id="main_img">
    <div id="up_light">
    <img src="img/light_.png" id="up_light_ico" onclick="light_on_white()">
    <input type="range" value="1" min="1" max="20" id="up_light_range"/>
    </div>

    <div id="down_light">
        <img src="img/light_.png" id="down_light_ico">
        <input type="range" value="0" max="100" id="down_light_range"/>
    </div>

    <div id="down_rgb">
        <img src="img/rgb.png" id="down_rgb_ico">
        <input type="range" value="0" max="100" id="down_rgb_r_range"/>
        <input type="range" value="0" max="100" id="down_rgb_g_range"/>
        <input type="range" value="0" max="100" id="down_rgb_b_range"/>
    </div>

    <div id="up_light_sensor">
        <img src="img/sun.png" id="up_light_sensor_ico">
        <p id="up_light_sensor_p">22</p>
    </div>

    <div id="down_light_sensor">
        <img src="img/sun.png" id="down_light_sensor_ico">
        <p id="down_light_sensor_p">33</p>
    </div>

    <div id="up_therm_sensor">
        <img src="img/therm.png" id="up_therm_sensor_ico">
        <p id="up_therm_p">44</p>
    </div>

</div>

<script>
    $(document).ready(function(){
        var w = $(window).width(); //Ширина браузера
        var h = $(window).height(); //Высота браузера

        $("#main_img").css("width", w);
        var h_house = $("#main_img").height();

        var w_up_light = w*90/1000;
        $('#up_light_ico').css('width', w_up_light);
        $("#up_light").css({'left' : w/2-w_up_light/2, 'top':'-'+ (h_house/100*90) +'px', 'width':"100px"});
        $("#up_light_range").css({'background' : '#fdee00', 'top': '-20px'});

        $('#down_light_ico').css('width', w_up_light);
        $("#down_light").css({'left' : w/2-w_up_light/2, 'top':'-'+ (h_house/100*67) +'px', 'width':"100px"});
        $("#down_light_range").css({'background' : '#fdee00', 'top': '-20px'});

        var w_rgb_ico = w*50/1000;
        $('#down_rgb_ico').css('width', w_rgb_ico);
        $("#down_rgb").css({'left' : w/3-w_rgb_ico/2, 'top':'-'+ (h_house/100*70) +'px', 'width':"100px"});
        $("#down_rgb_r_range").css({'left' : '-' + w_rgb_ico/2 +'px', 'background' : '#fc0000'});
        $("#down_rgb_g_range").css({'left' : '-' + w_rgb_ico/2 +'px',  'background' : '#00ff00'});
        $("#down_rgb_b_range").css({'left' : '-' + w_rgb_ico/2 +'px',  'background' : '#0000ff'});

        var w_up_light_sensor_ico = w*80/1000;
        $("#up_light_sensor_ico").css({'width': w_up_light_sensor_ico});
        $("#up_light_sensor").css({'left' : w/3-w_up_light_sensor_ico/2, 'top':'-'+ (h_house/100*135) +'px', 'height':w_up_light_sensor_ico*1.5, 'width':w_up_light_sensor_ico});
        $("#up_light_sensor_p").css({'left' : w_up_light_sensor_ico/2.9 + 'px', 'font-size': w_up_light_sensor_ico/3, 'top': '-' +(w_up_light_sensor_ico+w_up_light_sensor_ico/8) + 'px'});

        $('#down_light_sensor_ico').css({'width': w_up_light_sensor_ico});
        $("#down_light_sensor").css({'left' : w/1.5-w_up_light_sensor_ico/2, 'top':'-'+ (h_house/100*110) +'px', 'height':w_up_light_sensor_ico*1.5, 'width':w_up_light_sensor_ico});
        $("#down_light_sensor_p").css({'left' : w_up_light_sensor_ico/2.9 + 'px', 'font-size': w_up_light_sensor_ico/3, 'top': '-' +(w_up_light_sensor_ico+w_up_light_sensor_ico/8) + 'px'});

        var w_up_therm_sensor_ico = w*50/1000;
        $("#up_therm_sensor_ico").css({'width': w_up_therm_sensor_ico});
        $("#up_therm_sensor").css({'left' : w/1.5-w_up_therm_sensor_ico/2, 'top':'-'+ (h_house/100*170) +'px', 'width': w_up_therm_sensor_ico});
        $("#up_therm_p").css({'left' : w_up_therm_sensor_ico/4 + 'px', 'font-size': w_up_therm_sensor_ico/2, 'top': '-' +(w_up_therm_sensor_ico+w_up_therm_sensor_ico/3) + 'px', 'color' : "white"});


        $("#up_light_range").change(function(){
            var newval=$(this).val();
            light_on_white(newval);
        });

    })
</script>
<script src="js/main.js"></script>
</body>
</html>

<?php
