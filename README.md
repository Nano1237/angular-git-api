# angular-git-api

A Git Api Module, written as "plug and play" module.

## DEMO

[Demo fiddle](http://jsfiddle.net/gh/get/AngularJS/1.2.1/Nano1237/angular-git-api/tree/master/demo), with working example

## Quick use

1. Clone the repository 
```
$ git clone https://github.com/Nano1237/angular-git-api.git
```
2. Include the Javascript file
```html
<script src="{path-to-js-files}/angular-git-api.js"></script>
```
3. Add the Module in your AngularJS app `"angular-git-api"`

Now you can access all Api Actions!

## Advanced help

#### How to add the Module to my App?

If this is the first module you are using, look at the example below.
```javascript
...
angular.module('myApp', [
    ...
    'angular-git-api' //Add the new Module Name here!
    ...
]);
...
```

### Which Methods exists in the Git Service?

Here you can find a list of possible Methods:

* `api(apiAddress[String], apiData[Object])` *makes a ajax call to `//api.github.com/{apiAddress}?{apiData}`*
* `getFilesInFolder(username[String], repo[String], path[String])` *makes an ajax call to `//api.github.com/repos/{username}/{repo}/contents/{path}` and returns a object with loadet files*
* `getUserRepos(userName[String])` *makes an ajax call to `//api.github.com/users/{userName}/repos`*
* `init(InitObject[Object])` *Overrides the params of the Init Object*

#### How to make an Api call?

```javascript
.controller('DemoCtrl', [
    'Git', //Get the Git Service
    function(Git) {
        //This example returns a list of files in this repository folder
        Git.api('repos/Nano1237/angular-git-api/contents/').then(function(a) {
            console.log('response: ', a);
        });
    }
])
```

#### How to use the Flair directive?

For more information about the users/:nickname api visit the [API Docs](https://developer.github.com/v3/users/)
```html
<!-- 
    This Directive Interpolates the Githubs users/:nickname api repsonse into the directives content.
    You can find the Api repsonse inside of the gitFlair Object
-->
<git-flair gitFlairUser="Nano1237"><!-- You need this property if you didnt used the init Method or if you want to show the Flair of someone else -->
    <img src="{{gitFlair.avatar_url}}" alt="{{gitFlair.login}}" />
    {{gitFlair.name}} ({{gitFlair.login}})<br>
    {{gitFlair.public_repos}} Repos
</git-flair>
```

