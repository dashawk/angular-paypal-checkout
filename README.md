# Angular Paypal Checkout Button

This directive implements the paypal checkout button in `AngularJs 1.x`.

## Installation

Bower:

```cli
    bower install angular-paypal-checkout --save
```

## Get Started

Add the `jmp.paypalCheckout` to your Angular module as dependency.

`angular.module('app', ['jmp.paypalCheckout']);`

There is no need to install other dependencies for this to work.

In your controller, create the configuration variables. You can use the options provided in the paypal api as well.

```javascript
    angular
        .module('app')
        .contoller('yourController', function ($scope) {
            /**
             * Complete configuration
             * 
             * */
            $scope.config = {
                /**
                 * This is a boolean type variable. If this variable is missing
                 * in the configuration, it will assume that you are in production mode
                 * */
                sandbox: true,
                sandboxClientID: '',
                productionClientID: '',

                useConfirmation: false, // Not yet implemented

                locale: 'en_GB',        // Optional
                style: {
                    size: 'medium',     // small | medium | large | responsive
                    label: 'Checkout',
                    shape: 'pill',      // pill | rect
                    color: 'gold'       // gold | blue | silver | black
                },
                payments: {
                    currency: 'USD',
                    shippingFee: 0,     // Optional
                    tax: 0,             // Optional
                    referenceID: '',    // Optional
                    totalAmount: 100,   // total amount to be paid

                    /**
                     * Optional. If ever you want to fill this in,
                     * make sure that the sub total amount
                     * should match in the total amount
                     * */
                    items: [
                        {
                            name: '',
                            description: '',
                            quantity: 1,
                            price: 100,
                            tax: 0,
                            sku: 'SKU-TEST',
                            currency: 'USD'        
                        }
                    ]
                }
            };

            $scope.onReady = function () {
                // After paypal is initialized
            };

            $scope.onComplete = function (result) {
                // After completing the payment, this will execute
            };
        });
```

Then use the directive:
```html
    <paypal-checkout
        config="config"
        on-ready="onReady()"
        on-complete="onComplete($result)">
    </paypal-checkout>
```

## Demo

Demo coming soon