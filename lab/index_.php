<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Виртуальная лаборатория</title>
    <link rel="stylesheet" href="../css/lab-css.css">
    <link rel="stylesheet" href="../css/jquery.mobile-1.4.5.min.css">
    <script src="js/jquery.js"></script>
    <script src="js/jquery.mobile-1.4.5.min.js"></script>


</head>
<body onload="funonload();">

<h1>Виртуальная лаборатория</h1>

<div class="lab-main-for-col">
    <div class="lab-feft-col">
        <div class="lab-table-row">
            <div class="item-col">
                <p>Видео</p>
            </div>
        </div>
        <div class="lab-table-row">
            <div class="item-col">
                <table style="width: 100%;">
                    <tr>
                       <td><img src="img/light.png" width="60"></td>
                        <td>
                            <form>
                                    <label for="slider-2">Slider:</label>
                                    <input type="range" name="slider-2" id="slider-2" data-highlight="true" min="0" max="100" value="50">
                            </form>
                        </td>
                    </tr>
                    <tr>
                        <td><img src="img/thermometer.png" width="60"></td>
                        <td>
                            <form>
                                    <label for="slider-3">Slider2:</label>
                                    <input type="range" name="slider-3" id="slider-3" data-highlight="true" min="0" max="100" value="50">
                            </form>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="lab-table-row">
            <div class="item-col">
                <p>Авторизация</p>
            </div>
        </div>
    </div>

    <div class="lab-right-col">
        <div class="lab-table-row">
            <div class="lab-table-row">
                <div class="item-col">
                    <p>Видео</p>
                </div>
            </div>
            <div class="lab-table-row">
                <div class="item-col">
                    <p>Датчики</p>
                </div>
            </div>
            <div class="lab-table-row">
                <div class="item-col">
                    <p>Авторизация</p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    function funonload() {
        var w = $(window).width(); //Ширина браузера
        var h = $(window).height(); //Высота браузера

        $(".item-col").css("width", w/2)
    }
</script>

</body>
</html>

<?php

?>