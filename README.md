# NHL Player Image Grabber :trophy:
NPM/Node CLI utility that finds NHL Player headshot images.

#### Usage
    $ sudo npm install -g nhlpimg
    $ nhlpimg "FIRST_NAME LAST_NAME"

#### Example
    $ nhlpimg "Sidney Crosby"
    » https://nhl.bamcontent.com/images/headshots/current/168x168/8471675.png

    $ nhlpimg "Wayne Gretzky"
    » https://nhl.bamcontent.com/images/headshots/current/168x168/8447400.png

#### Messages
- **`DEF_IMAGE_GOALIE`** _Default goaltender image was found ([https://goo.gl/r60Q8q](https://goo.gl/r60Q8q))._

- **`DEF_IMAGE_SKATER`** _Default skater image was found ([https://goo.gl/CJSjvn](https://goo.gl/CJSjvn))._

- **`CONNECTION_ERROR`** _Error connecting/scanning NHL website._

- **`NOT_FOUND`** _Image was not found._
