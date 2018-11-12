# [Контрольные карты Шухарта](https://blackgrizzly.github.io/control-charts/)
Контрольная карта Шухарта — это визуальный инструмент, график изменения параметров процесса во времени. Контрольная карта используется для обеспечения статистического контроля стабильности процесса. Своевременное выявление нестабильности позволяет получить управляемый процесс, без чего никакие улучшения невозможны в принципе. Контрольные карты впервые введены в 1924 году Уолтером Шухартом с целью снижения вариабельности процессов путём исключения отклонений, вызванных несистемными причинами.

## Установка
Просто скачайте файлы проекта и запустите [index.html](https://blackgrizzly.github.io/control-charts/) в браузере (предпочтительно в Google Chrome)

## Работа с картами
1. Определить объем выборки (количество выбранных элементов для эксперимента), например:
+ количество производимой продукции за выбранный интервал времени;
+ время цикла операций за выбранный интервал времени;
+ любой другой параметр процесса, подлежащий статистическому анализу.
2. При использовании двойной карты х – Х, определить величину подгруппы от 2 до 10
3. Выбрать количество планируемых экспериментов (количество выборок)
4. Определить количество последовательных экспериментов, начиная с первого, по которым программы будет рассчитывать естественные границы процесса
5. Выбрать вид контрольной карты или карт, которую собираешься использовать для анализа процесса
6. Выбрать какое/какие правила специальных причин вариаций, которые будут использоваться для проверки
7. Создать таблицу нажатием на кнопку «Создать таблицу»
8. Заполнить таблицу данными (если стоит флажок «Сгенерировать случайные числа», данные в таблице будут заполнены автоматически)
9. Кнопка «Показать» выведет контрольные карты на экран

## О программе
Программа написана с использованием JavaScript библиотеки [D3.js](https://github.com/d3/d3)

## Поддержка
О возникших проблемах, а также пожелания по улучшению пишите [сюда](https://github.com/BlackGrizzly/control-charts/issues).

____

# [Shewhart control charts](https://blackgrizzly.github.io/control-charts/)
The Shewhart control chart is a visual tool, a graph of changes in process parameters over time. The control chart is used to provide statistical control of the stability of the process. Timely detection of instability allows you to get a controlled process, without which no improvement is impossible in principle. Control charts were first introduced in 1924 by Walter Shewhart in order to reduce the variability of processes by eliminating deviations caused by non-systemic causes.

## Installation
Just download the project files and run [index.html](https://blackgrizzly.github.io/control-charts/) in the browser (preferably in Google Chrome)

## Working with charts
1. Determine the sample size (the number of selected elements for the experiment), for example:
+ the number of products produced for the selected time interval;
+ operation cycle time for the selected time interval;
+ any other process parameter to be statistically analyzed.
2. When using a double x – X card, determine the value of the subgroup from 2 to 10
3. Select the number of planned experiments (number of samples)
4. Determine the number of consecutive experiments, starting with the first, on which the program will calculate the natural boundaries of the process
5. Select the type of control chart or charts you want to use to analyze the process
6. Choose what kind of rules for special causes of variation that will be used to check
7. Create a table by clicking on the "Create table" button
8. Fill the table with data (if the "Generate random numbers" checkbox is selected, the data in the table will be filled in automatically)
9. The "Show" button will display the control cards on the screen

## About the program
The program is written using JavaScript library [D3.js](https://github.com/d3/d3)

## Support
About the problems, as well as suggestions for improvement write [here](https://github.com/BlackGrizzly/control-charts/issues).
