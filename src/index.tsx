import { URL } from 'react-native-url-polyfill';
import React, { useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';

import { getHtmlCode, getQueryParams } from './utils';

interface ThemeOptions {
  /**
   * Hexadecimal color for all the elements
   */
  elements?: string;
  /**
   * Hexadecimal color for the header
   */
  header?: string;
}

export interface MercadoPagoWebTokenizeCheckoutProps {
  /**
   * The amount to pay for the product
   */
  amount: number;
  /**
   * The action where the data will be sent
   */
  action: string;
  /**
   * The Public Key for MP
   */
  publicKey: string;
  /**
   * Flag to restore the payment state if failure
   */
  keepOpen?: boolean;
  /**
   * Redirect url when payment success
   */
  successUrl: string;
  /**
   * Redirect url when payment fail
   */
  failureUrl: string;
  /**
   * Callback executed when backend redirects to success or failure url
   */
  onPaymentResult?: (paymentData: any, error: boolean) => void;
  /**
   * The cards associated to the customer
   */
  cardsIds?: string[];
  /**
   * The ID for the customer
   */
  customerId?: string;
  /**
   * The theme for the checkout
   */
  theme?: ThemeOptions;
  /**
   * The label for the product
   */
  productLabel?: string;
  /**
   * The label for the discount
   */
  discountLabel?: string;
  /**
   * The total installments for the payment
   */
  maxInstallments?: number;
  /**
   * The amount for the discount
   */
  discount?: number;
  /**
   * The amount for the shipping
   */
  shipping?: number;
  /**
   * The amount for the additional charge
   */
  charge?: number;
  /**
   * The amount for the taxes
   */
  taxes?: number;
  /**
   * The amount for the arrears
   */
  arrears?: number;
  /**
   * The additional styles to customize the WebView
   */
  style?: any;
}

const MercadoPagoWebTokenizeCheckout: React.FC<MercadoPagoWebTokenizeCheckoutProps> = React.forwardRef(
  (props: MercadoPagoWebTokenizeCheckoutProps, ref: React.Ref<WebView>) => {
    const webviewRef: any = useRef(ref);

    return useMemo(
      () => (
        <WebView
          ref={webviewRef}
          scalesPageToFit
          domStorageEnabled
          javaScriptEnabled
          startInLoadingState
          sharedCookiesEnabled
          originWhitelist={['*']}
          thirdPartyCookiesEnabled
          source={getHtmlCode(props)}
          allowUniversalAccessFromFileURLs
          keyboardDisplayRequiresUserAction
          style={[styles.container, props.style]}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes('action=')) {
              const url = new URL(navState.url);

              const action = url.searchParams.get('action');

              if (!action) {
                url.searchParams.delete('action');
                url.searchParams.append('action', props.action);

                const newURL = `${url.protocol}//${url.hostname}${url.pathname}?${url.searchParams}`;

                webviewRef.current.injectJavaScript(
                  `window.location = "${newURL}";`
                );
              }
            }

            if (typeof props.onPaymentResult === 'function') {
              if (navState.url.includes(props.successUrl)) {
                webviewRef.current.stopLoading();
                props.onPaymentResult(getQueryParams(navState.url), false);
              }

              if (navState.url.includes(props.failureUrl)) {
                webviewRef.current.stopLoading();
                props.onPaymentResult(getQueryParams(navState.url), true);
              }
            }
          }}
        />
      ),
      [props]
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MercadoPagoWebTokenizeCheckout;
