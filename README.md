# sitelen lawa

Work in progress! Not ready for use yet, but happy to take feedback.

[Demo Site](https://irl.github.io/sitelen-lawa/)

## Features

* Multilingual

## Installation

* Create a new Hugo site
* Install the npm requirements: govuk-frontend, hmrc-frontend, line-awesome, inter-ui
* Install the theme: cd $site/themes; git clone https://github.com/irl/sitelen-lawa.git

## Configuration

Need to add mounts to Hugo config.

If you're configuring multilingual mode, you need to add a `changeText` param to the languages
that contains a translation of the English text: "Change language to $language_name", e.g.
for toki pona: "o ante e toki tawa toki pona".

## Acknowledgements

* GOV.UK Design System team
* Font Awesome
* Inter
