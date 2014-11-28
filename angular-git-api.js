angular.module('angular-git-api', [])
        /**
         * @description This Constant Contains the Url of the Github Api
         */
        .constant('angular-git-api.apiUrl', 'https://api.github.com/')
        /**
         * 
         * @description Trys to get the public repositorys form a user and returns a deferrer promise
         * @param {String} url The Url of the github api service
         * @param {Object} $q The Service for Async Callbacks
         * @param {Object} $http The Service for Async requests
         * @returns {Object}
         */
        .factory('getGitRepos', [
            'angular-git-api.apiUrl',
            '$q',
            '$http',
            function(url, $q, $http) {
                return function(user) {
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
        .factory('getGitRepoContentList', [
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
        .factory('getGitFilesInFolder', [
            'getGitRepoContentList',
            '$q',
            '$http',
            function(getGitRepoContentList, $q, $http) {
                function b64_to_utf8(str) {
                    return decodeURIComponent(escape(window.atob(str)));
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
                            if (repoFileList[index].type !== 'file') {//Remove Folder or not files from list
                                repoFileList.splice(index, 1);
                                continue;
                            }
                            amount++;
                        }
                        if (amount === 0) {
                            deferred.reject('no files');
                            return;
                        }
                        for (var index in repoFileList) {
                            (function(repoFile, until) {
                                $http.get(repoFile._links.git).success(function(loadetRepoFile) {
                                    fileCache[repoFile.name] = b64_to_utf8(loadetRepoFile.content);
                                    if (++filesLoadet === until) {
                                        deferred.resolve(fileCache);
                                    }
                                });
                            })(repoFileList[index], amount);
                        }
                    });
                    return deferred.promise;
                };
            }
        ]);