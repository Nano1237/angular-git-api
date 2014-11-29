angular.module('angular-git-api', [])
        /**
         * @description This Constant Contains the Url of the Github Api
         */
        .constant('angular-git-api.apiUrl', 'https://api.github.com/')
        /**
         * 
         * @description Contains the Init-Data from the user
         * @returns {_L141.Anonym$7}
         */
        .factory('angular-git-api.initData', function() {
            return {};
        })

        /**
         * 
         * @description Trys to get the public repositorys form a user and returns a deferrer promise
         * @param {String} url The Url of the github api service
         * @param {Object} $q The Service for Async Callbacks
         * @param {Object} $http The Service for Async requests
         * @param {Object} initData The Information, received from the init method
         * @returns {Object}
         */
        .factory('angular-git-api.userRepos', [
            'angular-git-api.apiUrl',
            '$q',
            '$http',
            'angular-git-api.initData',
            function(url, $q, $http, initData) {
                return function(user) {
                    user = user || initData.user;
                    var deferred = $q.defer();
                    $http.get(url + 'users/' + user + '/repos').success(deferred.resolve);
                    return deferred.promise;
                };
            }
        ])
        /**
         * 
         * @description Returns a list of files in a repository from a specific user
         * @param {String} url The Url of the github api service
         * @param {Object} $q The Service for Async Callbacks
         * @param {Object} $http The Service for Async requests
         * @returns {Object}
         */
        .factory('angular-git-api.getGitRepoContentList', [
            'angular-git-api.apiUrl',
            '$q',
            '$http',
            function(url, $q, $http) {
                return function(user, repo, path) {
                    path = path || '';
                    if (typeof user !== 'string' || typeof repo !== 'string') {
                        //return exception
                        return;
                    }
                    var deferred = $q.defer();
                    $http.get(url + 'repos/' + user + '/' + repo + '/contents/' + path).success(deferred.resolve);
                    return deferred.promise;
                };
            }
        ])
        /**
         * 
         * @description Returns a Object with Files in a repository Folder
         * @param {Function} getGitRepoContentList This Service returns a list with filenames in a repository
         * @param {Object} $q The Service for Async Callbacks
         * @param {Object} $http The Service for Async requests
         * @returns {Object}
         */
        .factory('angular-git-api.getFilesInFolder', [
            'angular-git-api.getGitRepoContentList',
            '$q',
            '$http',
            function(getGitRepoContentList, $q, $http) {
                function b64_to_utf8(str) {
                    return decodeURIComponent(escape(window.atob(str.replace(/\s/g, ''))));
                }
                return function(username, repo, path) {
                    if (!window.atob) {
                        //@todo no atob exception
                        return;
                    }
                    var deferred = $q.defer();
                    getGitRepoContentList(username, repo, path).then(function(repoFileList) {
                        var amount = 0, fileCache = {}, filesLoadet = 0;
                        for (var index in repoFileList) {
                            if (repoFileList[index].type === 'file') {//Remove Folder or not files from list
                                amount++;
                            }
                        }
                        if (amount === 0) {
                            deferred.reject('no files');
                            return;
                        }
                        for (var index in repoFileList) {
                            if (repoFileList[index].type === 'file') {
                                (function(repoFile, until) {
                                    $http.get(repoFile._links.git).success(function(loadetRepoFile) {
                                        fileCache[repoFile.name] = b64_to_utf8(loadetRepoFile.content);
                                        if (++filesLoadet === until) {
                                            deferred.resolve(fileCache);
                                        }
                                    });
                                })(repoFileList[index], amount);

                            }
                        }
                    });
                    return deferred.promise;
                };
            }
        ])


        .factory('angular-git-api.api', [
            '$q',
            '$http',
            'angular-git-api.apiUrl',
            function($q, $http, url) {
                return function(api_target, apiData) {
                    var deferred = $q.defer();
                    $http.get(url + api_target).success(deferred.resolve);
                    return deferred.promise;
                };
            }
        ])


        .factory('Git', [
            'angular-git-api.api',
            'angular-git-api.getFilesInFolder',
            'angular-git-api.userRepos',
            'angular-git-api.initData',
            function(api, getGitFilesInFolder, getGitRepos, initData) {
                return {
                    api: api,
                    getFilesInFolder: getGitFilesInFolder,
                    getUserRepos: getGitRepos,
                    init: function(data) {
                        for (var index in data) {
                            initData[index] = data[index];
                        }
                    }
                };
            }
        ])

        /**
         * 
         * @description Interpolates the Github userdata received from the github api from the inituser or the user in the gitFlairUser Property
         * @param {Function} api The Api Service
         * @param {_L141.Anonym$7} initData The Initdata
         * @param {Function} $interpolate
         * @returns {_L155.Anonym$9}
         */
        .directive('gitFlair', [
            'angular-git-api.api',
            'angular-git-api.initData',
            '$interpolate',
            function(api, initData, $interpolate) {
                return {
                    compile: function(e, b) {
                        var user = b.gitflairuser ? b.gitflairuser : initData.user;
                        if (typeof user === 'undefined') {
                            e.html('Error: no username!');
                            return;
                        }
                        var oldContent = e.html();
                        e.html('Loading Flair...');
                        api('users/' + user).then(function(a) {
                            var newContent = '';
                            if (oldContent.length > 0) {
                                newContent = $interpolate(oldContent)({gitFlair: a});
                            } else {
                                newContent = 'Error: no content!';
                            }
                            e.html(angular.element('<div>' + newContent + '</div>'));
                        });
                    }
                };
            }
        ]);