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
        onEnter: '&?',
        onComplete: '&?',
        onCancel: '&?'
      },
      templateUrl: function (element, attrs) {
        return (
          attrs.templateUrl ||
          "jmp/templates/button.html"
        );
      },
      link: linkFn
    };

    function linkFn(scope, element, attrs) {
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
        var options = {
          env: 'sandbox'
        };

        if (config) {
          scope.$evalAsync(function () {
            if (!attrs.id) {
              scope.id = 'default';
            } else {
              scope.id = attrs.id;
            }

            if (!config.sandbox) {
              options.env = 'production';
            }

            options.client = {
              sandbox: config.sandboxClientID || '',
              production: config.productionClientID || ''
            };

            // Button styles
            options.style = config.style;

            // Enable / Disable Checkout Flow
            if (config.checkoutFlow) {
              options.commit = true;
            }

            // Payment events
            options.payment = payment;
            options.onEnter = onEnter;
            options.onAuthorize = onAuthorize;
            options.onCancel = onCancel;
            options.onError = onError;

            if (config.hasOwnProperty('transactions') &&
              typeof config.transactions === 'object' &&
              config.transactions.constructor === Array && config.transactions.length) {

              /**
               * Process multiple transactions
               */
              options.transactions = _processTransactions(config.transactions);

            } else if (config.hasOwnProperty('payments') &&
              typeof config.payments === 'object' &&
              config.payments.constructor === Object) {

              /**
               * Process single transaction
               */
              options.transactions = [_processPayments(config.payments)];
            }

            /**
             * Store the options in the scope
             */
            scope.options = options;

            _start(scope.options);
          });
        }
      }

      function _formatItemList(items) {
        var data = [];
        if (items && items.length) {
          for (var i = 0, length = items.length; i < length; i++) {
            var item = items[i];
            var _data = {
              name: item.name,
              description: item.description || '',
              quantity: item.quantity || 0,
              price: item.price || 0,
              tax: item.tax || 0,
              currency: item.currency
            };

            if (item.hasOwnProperty('sku')) {
              _data.sku = item.sku;
            }

            data.push(_data);
          }
        }

        return data;
      }
      function _processTransactions(transactions) {
        var data = [];
        if (transactions && transactions.length) {
          for (var i = 0, length = transactions.length; i < length; i++) {
            var item = transactions[i];
            var _data = {
              reference_id: item.referenceID || '',
              amount: {
                total: item.totalAmount,
                currency: item.currency,
                details: {
                  subtotal: item.subtotal || 0,
                  tax: item.tax || 0,
                  shipping: item.shipping || 0
                }
              }
            };

            if (item.hasOwnProperty('items') && item.length) {
              _data.item_list = _formatItemList(item.items);
            }

            if (item.hasOwnProperty('orderID')) {
              _data.purchase_order = item.orderID;
            }

            data.push(_data);
          }
        }

        return data;
      }
      function _processPayments(payment) {
        if (payment) {
          var data = {
            reference_id: payment.referenceID || '',
            amount: {
              total: payment.totalAmount,
              currency: payment.currency,
              details: {
                subtotal: payment.subTotalAmount,
                tax: payment.tax || 0,
                shipping: payment.shippingFee || 0
              }
            }
          };

          if (payment.hasOwnProperty('items')) {
            data.item_list = {
              items: _formatItemList(payment.items)
            };
          }

          return data;
        }
      }
      function _start(options) {
        if (window.paypal) {
          console.log(options);
          window.paypal.Button.render(options, "#paypal-button-" + scope.id);
        }
      }

      // Paypal Events
      function payment(data, actions) {
        return actions.payment.create({
          experience: {
            input_fields: {
              no_shipping: 1,
              address_override: 1
            }
          },
          payment: {
            payer: {
              payment_method: 'paypal'
            },
            transactions: scope.options.transactions
          }
        });
      }
      function onEnter() {
        if (scope.onEnter) {
          scope.$evalAsync(function () {
            scope.onEnter()(scope.options);
          });
        }
      }
      function onAuthorize(data, actions) {
        return actions.payment.execute().then(function (data) {
          if (scope.onComplete) {
            scope.$evalAsync(function () {
              scope.onComplete()(data, actions, scope.options);
            })
          }
        });
      }
      function onCancel(data, actions) {
        if (scope.onCancel) {
          scope.$evalAsync(function () {
            scope.onCancel()(data, actions, scope.options);
          });
        }
      }
      function onError(error) {
        if (scope.onError) {
          scope.$evalAsync(function () {
            scope.onError()(error, scope.options);
          });
        }
      }
    }
  }

  angular.module('jmp/templates/button.html', []).run(['$templateCache', function PaypalDefaultTemplate($templateCache) {
    $templateCache.put("jmp/templates/button.html",
      "<div class=\"jmp-directive paypal-checkout-button\">\n" +
        "<div id=\"paypal-button-{{ id }}\"></div>\n" +
      "</div>"
    );
  }]);
}());
