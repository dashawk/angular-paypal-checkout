(function () {
    
    angular
        .module("jmp.paypalCheckout", ['jmp/templates/button.html'])
        .directive("paypalCheckout", PaypalCheckoutDirective);

    /* @ngInject */
    function PaypalCheckoutDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                config: '=?',
                onReady: '&',
                onComplete: '&'
            },
            templateUrl: function (element, attrs) { 
                return (
                  attrs.templateUrl ||
                  "jmp/templates/button.html"
                );
            },
            link: linkFn
        };

        function linkFn(scope, element) {
            var apiUrl = 'https://www.paypalobjects.com/api/checkout.js';

            scope.environment = 'sandbox';

            scope.$watch('config', function (config) {
                if (config) {
                    initialize(config, attrs);
                }
            });

            if (!isReady(apiUrl)) {
                inject(apiUrl, attrs);
            } else { 
                scope.onReady();

                initialize(scope.config, attrs);
            }

        }
        function isReady(source) {
            var isReady = false;
            var scripts = angular.element('script');
            if (scripts.length) {
                for (var i = 0, len = scripts.length; i < len; i++) {
                    var src = String(scripts[i].src);
                    if (src.indexOf('http') !== -1) {
                        src = src.substr(src.indexOf('//'));
                    }

                    isReady = src === source;
                    if (isReady) {
                        break;
                    }
                }
            }
            return isReady;
        }
        function inject(source, attrs) {
            var script = document.createElement("script");
            script.setAttribute("src", source);

            script.onload = function (e) {
                initialize(scope.config, attrs);
            };

            document.body.appendChild(script);
        }
        function initialize(config, attrs) {
            if (config) {
                scope.$evalAsync(function() {
                    if (!attrs.id) {
                        scope.id = 'paypal-checkout-button';
                    } else { 
                        scope.id = attrs.id;
                    }

                    if (!config.sandbox) { 

                    }
                });
            }
        }

        function onPayment() {

        }
        function onEnter() {

        }
        function onAuthorize(data, actions) { 
            return actions.payment.execute().then(function (data) {
                scope.onComplete()(data, actions);
            });
        }
        function onCancel(data, actions) {

        }
        function onError(error) {

        }
    }

    angular.module('jmp/templates/button.html', []).run(['$templateCache', function PaypalDefaultTemplate($templateCache) {
        $templateCache.put("jmp/templates/button.html",
            "<div class=\"jmp-directive paypal-checkout-button\">\n" +
                "<div id=\"{{ id }}\"></div>\n" +
            "</div>"
        );
    }]);
}());