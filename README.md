# Github Language Stats :eyes:
 Express app that let you query user's programming languages on github!

 ## Example

 This are the current stats of my profile, the image was generated the moment you visited this site :scream:.

 ![MrMarble Stats](https://gitlang.mrmarble.dev/mrmarble?format=svg&background=%23eee "MrMarble languages stats")


In json format (not in real time):
```json
{
   "JavaScript":{
      "bytes":261024,
      "percent":77.84,
      "color":"#f1e05a"
   },
   "Python":{
      "bytes":69303,
      "percent":20.67,
      "color":"#3572A5"
   },
   "CSS":{
      "bytes":907,
      "percent":0.27,
      "color":"#563d7c"
   },
   "HTML":{
      "bytes":3514,
      "percent":1.05,
      "color":"#e34c26"
   },
   "TSQL":{
      "bytes":601,
      "percent":0.18,
      "color":"#3a1"
   },
   "totalBytes":335349
}
```

___

 ## Usage

 I have a hosted version on https://gitlang.mrmarble.dev/ you are free to use it but please don't abuse.

 ### Params

 - **username**
   - To query a user simple append the name at the end of the url: `https://gitlang.mrmarble.dev/mrmrable`
 - **format**
   - `json|svg` are the available formats at the moment, use a query parameter: `https://gitlang.mrmarble.dev/mrmarble?format=svg`
 - **background**
   - Only available for the svg format, it sets the background color, use hex value (encode the # symbol with %23): `https://gitlang.mrmarble.dev/mrmarble?format=svg&%237f3`

### Host your own
 First, you'll need a Github OAuth token, you can get yours at https://github.com/settings/developers.

We'll also need a redis database, for caching purposes, the best way to do it is with docker-compose, just copy this one:
 ```yml
 version: "3"

services:
  gitlang:
    image: mrmarble/github-stats:latest
    restart: always
    ports:
      - "8765:8000" # Change this as you need, but keep in mind that the app uses the port 8000
    depends_on:
      - redis
    links:
      - redis
    environment: 
      - "GITHUB_TOKEN=${GITHUB_TOKEN}" # Here you have to set your github token or use a .env file
  redis:
    container_name: redis
    image: redis:6.0-alpine # Should work with other versions

 ```

 Save it as docker-compose.yml and run `docker-compose up -d` and it's done! start using it at http://localhost:8765/
___

 ## Building

 If you want to build your own in case you want to contribute or change something for yourself you'll need node (at least version 10) and docker.

1. Clone the repo and run `npm install` to set up the dependencies.
2. Create a `.env` file and paste your [OAuth Github token](https://github.com/settings/developers) like `GITHUB_TOKEN=<your_token>`
3. Run `docker-compose up -d` it will automatically transpile the source, build a docker image and start a redis server.
4. Access your local version at http://localhost:8000/
5. Profit.

This project uses Flow JS for types, to check if your changes are correct use `npm run flow`, to lint your code `npm run lint`.

# CONTRIBUTING

This is a personal proyect, even tho there is linting and type checking,there are no tests what so ever but if you know more javascipt than me or simply want to add or change something, feel free to make a pull request.