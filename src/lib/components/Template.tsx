import React, { useReducer, useEffect, memo } from "react";
import type { ReactNode } from "react";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { assert } from "../tools/assert";
import { useCallbackFactory } from "powerhooks/useCallbackFactory";
import { headInsert } from "../tools/headInsert";
import { pathJoin } from "../../bin/tools/pathJoin";
import { useConstCallback } from "powerhooks/useConstCallback";
import type { KcTemplateProps } from "./KcProps";
import { clsx } from "../tools/clsx";
import type { I18n } from "../i18n";

export type TemplateProps = {
    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    displayWide?: boolean;
    showAnotherWayIfPresent?: boolean;
    headerNode: ReactNode;
    showUsernameNode?: ReactNode;
    formNode: ReactNode;
    infoNode?: ReactNode;
    /** If you write your own page you probably want
     * to avoid pulling the default theme assets.
     */
    doFetchDefaultThemeResources: boolean;
} & { kcContext: KcContextBase; i18n: I18n } & KcTemplateProps;

const HADEAN_LOGO_BASE64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAA1CAYAAAD4bU3WAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAPSSURBVHgB7Vn/VdswEL709f+kE9SdoOkEERM0G2AmaDoBZgLCBDETECZIOgF0gqQTECZQ70NnchGynVBkCk/fe/dsSSdLPt0vSUQJCQkJCQkJCQkJgLV2wDRmmjBdMd3hnV4JPeoQ+Hl+DIVG8swCrCXTptfr/aSO8ZE6Agsj54fBK7mFyCgsjArQmD8slCl1iE4EooRxrKqX5DThnqlPTjhG2u7lec59b1koS3pP4J+6YZraZoBnVvkPKVvxKRl1hA8UGfwzhpyv+NzCCp5vTBn3gSbdMl0ywe8sxP9ER3SBMHJ5blr4SqYV0w9ygkE/ON65tJ9TB4gqEFH1ym80RbQLckIYe/WZ1C3Rn793SpER26kW6t0G2tfkzAJaoU0ik7ZMyrmUNzAddrJt2vb/AdrBtFJOc+6V4RfKGge7Ev4QFhQRMU3G0G6eAadarWwpz+OavhnV+5yoyVpMk/HtHSbxi+manCCylv4hgVxQu3P+J0QRiITaNTlnWOGabR9mcEPtwgD6XhnRps/fWFNExNIQ5BDQiDFtnaVhYXwlt8KXUveddp2pxr16/830hSl6Gh9FIIgC/PMn/KodYMb0ibbp+ZqcBm1oN22v0Jc2EAQ84u+W9JaBPYwXIeaSioeiylRo5UWlKhIV9B6AH1E/fmfrw+ljWBUhYLc7VALMqANET91ZzQt+nEkR/mLd0sXQbohGnzK2M+0cSvVnLdpRKLMpRUMMvUdYt6UvGwSx8OohjII6xGscIc7IRRVs99fkEjWEYyNsG6lHZEG4nXdpLp0KBBDnmNPWn6B8K7R+kxu3hISEhIRnwrqTrxnSaFWHPcqsgXcaaBtIW0VFKB33eECThnGKQNtQ2nJVNw7N91lAlihJUq7qHpKrAK/ezBl6+hNWstCF3e5RJh5flZAthELC1cndoGa+tlpEEb6lPfDSexmchCHRQi4xruG55FzjiNz5BnKPU/v0zgXJ2JFQ6OIb1xPVmUpO9Tj46uIQgTyYiajeyG8U9TfkTrYw2eOmj0kCVl1EZV6zUSZjvHGM8ENzluQOmUKYy3cmdAAOEchnar6gNmoiS6aBbd+U6R2txqBhrJxcRgvtgjYaG77Vu5B5nFL7reH+2NeH2KcbM6vtX/mQwv+OVc5VyrOG+awC40wC8zUy5uOBFO2BF/EhylywKidCWMGQ2YzEyV1Je+isYyg8hbcQhpzWnKlxoGVBs5HvntFLwrowhlUZq7qHoz5VHgtPpupyqas8fXVxpakIjOfzLFQbBHTj8Rd6bDVfo3gWer4JCQkJCQkJCQlvAH8B2gZM0AvzvAsAAAAASUVORK5CYII=`;

const Template = memo((props: TemplateProps) => {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        displayWide = false,
        showAnotherWayIfPresent = true,
        headerNode,
        showUsernameNode = null,
        formNode,
        infoNode = null,
        kcContext,
        i18n,
        doFetchDefaultThemeResources
    } = props;

    const { msg, changeLocale, labelBySupportedLanguageTag, currentLanguageTag } = i18n;

    const onChangeLanguageClickFactory = useCallbackFactory(([kcLanguageTag]: [string]) => changeLocale(kcLanguageTag));

    const onTryAnotherWayClick = useConstCallback(() => (document.forms["kc-select-try-another-way-form" as never].submit(), false));

    const { realm, locale, auth, url, message, isAppInitiatedAction } = kcContext;

    const [isExtraCssLoaded, setExtraCssLoaded] = useReducer(() => true, false);

    useEffect(() => {
        if (!doFetchDefaultThemeResources) {
            setExtraCssLoaded();
            return;
        }

        let isUnmounted = false;
        const cleanups: (() => void)[] = [];

        const toArr = (x: string | readonly string[] | undefined) => (typeof x === "string" ? x.split(" ") : x ?? []);

        Promise.all(
            [
                ...toArr(props.stylesCommon).map(relativePath => pathJoin(url.resourcesCommonPath, relativePath)),
                ...toArr(props.styles).map(relativePath => pathJoin(url.resourcesPath, relativePath))
            ]
                .reverse()
                .map(href =>
                    headInsert({
                        "type": "css",
                        href,
                        "position": "prepend"
                    })
                )
        ).then(() => {
            if (isUnmounted) {
                return;
            }

            setExtraCssLoaded();
        });

        toArr(props.scripts).forEach(relativePath =>
            headInsert({
                "type": "javascript",
                "src": pathJoin(url.resourcesPath, relativePath)
            })
        );

        if (props.kcHtmlClass !== undefined) {
            const htmlClassList = document.getElementsByTagName("html")[0].classList;

            const tokens = clsx(props.kcHtmlClass).split(" ");

            htmlClassList.add(...tokens);

            cleanups.push(() => htmlClassList.remove(...tokens));
        }

        return () => {
            isUnmounted = true;

            cleanups.forEach(f => f());
        };
    }, [props.kcHtmlClass]);

    if (!isExtraCssLoaded) {
        return null;
    }

    return (
        <div className={clsx(props.kcLoginClass)}>
            <div id="kc-header" className={clsx(props.kcHeaderClass)}>
                <div id="kc-header-wrapper" className={clsx(props.kcHeaderWrapperClass)}>
                    {/* {msg("loginTitleHtml", realm.displayNameHtml)} */}
                    <img src={HADEAN_LOGO_BASE64} width={68} alt="logo" />
                    <div id="kc-header-right">
                        {/* <div id="kc-header-right-text">{msg("doDontHaveAccount")}</div> */}
                        <div></div>
                        {/* <button tabIndex={0} onClick={() => {
                        window.location.href = 'https://portal.hadean.com/signup.jsp'
                      }}>
                        {msg("doSignUp")}
                      </button> */}
                    </div>
                </div>
            </div>

            <div className={clsx(props.kcFormCardClass, displayWide && props.kcFormCardAccountClass)}>
                <header className={clsx(props.kcFormHeaderClass)}>
                    {realm.internationalizationEnabled && (assert(locale !== undefined), true) && locale.supported.length > 1 && (
                        <div id="kc-locale">
                            <div id="kc-locale-wrapper" className={clsx(props.kcLocaleWrapperClass)}>
                                <div className="kc-dropdown" id="kc-locale-dropdown">
                                    <a href="#" id="kc-current-locale-link">
                                        {labelBySupportedLanguageTag[currentLanguageTag]}
                                    </a>
                                    <ul>
                                        {locale.supported.map(({ languageTag }) => (
                                            <li key={languageTag} className="kc-dropdown-item">
                                                <a href="#" onClick={onChangeLanguageClickFactory(languageTag)}>
                                                    {labelBySupportedLanguageTag[languageTag]}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {!(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
                        displayRequiredFields ? (
                            <div className={clsx(props.kcContentWrapperClass)}>
                                <div className={clsx(props.kcLabelWrapperClass, "subtitle")}>
                                    <span className="subtitle">
                                        <span className="required">*</span>
                                        {msg("requiredFields")}
                                    </span>
                                </div>
                                <div className="col-md-10">
                                    <h1 id="kc-page-title">{headerNode}</h1>
                                </div>
                            </div>
                        ) : (
                            <h1 id="kc-page-title">{headerNode}</h1>
                        )
                    ) : displayRequiredFields ? (
                        <div className={clsx(props.kcContentWrapperClass)}>
                            <div className={clsx(props.kcLabelWrapperClass, "subtitle")}>
                                <span className="subtitle">
                                    <span className="required">*</span> {msg("requiredFields")}
                                </span>
                            </div>
                            <div className="col-md-10">
                                {showUsernameNode}
                                <div className={clsx(props.kcFormGroupClass)}>
                                    <div id="kc-username">
                                        <label id="kc-attempted-username">{auth?.attemptedUsername}</label>
                                        <a id="reset-login" href={url.loginRestartFlowUrl}>
                                            <div className="kc-login-tooltip">
                                                <i className={clsx(props.kcResetFlowIcon)}></i>
                                                <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {showUsernameNode}
                            <div className={clsx(props.kcFormGroupClass)}>
                                <div id="kc-username">
                                    <label id="kc-attempted-username">{auth?.attemptedUsername}</label>
                                    <a id="reset-login" href={url.loginRestartFlowUrl}>
                                        <div className="kc-login-tooltip">
                                            <i className={clsx(props.kcResetFlowIcon)}></i>
                                            <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </header>
                <div id="kc-content">
                    <div id="kc-content-wrapper">
                        {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
                        {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                            <div className={clsx("alert", `alert-${message.type}`)}>
                                {message.type === "success" && <span className={clsx(props.kcFeedbackSuccessIcon)}></span>}
                                {message.type === "warning" && <span className={clsx(props.kcFeedbackWarningIcon)}></span>}
                                {message.type === "error" && <span className={clsx(props.kcFeedbackErrorIcon)}></span>}
                                {message.type === "info" && <span className={clsx(props.kcFeedbackInfoIcon)}></span>}
                                <span
                                    className="kc-feedback-text"
                                    dangerouslySetInnerHTML={{
                                        "__html": message.summary
                                    }}
                                />
                            </div>
                        )}
                        {formNode}
                        {auth !== undefined && auth.showTryAnotherWayLink && showAnotherWayIfPresent && (
                            <form
                                id="kc-select-try-another-way-form"
                                action={url.loginAction}
                                method="post"
                                className={clsx(displayWide && props.kcContentWrapperClass)}
                            >
                                <div className={clsx(displayWide && [props.kcFormSocialAccountContentClass, props.kcFormSocialAccountClass])}>
                                    <div className={clsx(props.kcFormGroupClass)}>
                                        <input type="hidden" name="tryAnotherWay" value="on" />
                                        <a href="#" id="try-another-way" onClick={onTryAnotherWayClick}>
                                            {msg("doTryAnotherWay")}
                                        </a>
                                    </div>
                                </div>
                            </form>
                        )}
                        {displayInfo && (
                            <div id="kc-info" className={clsx(props.kcSignUpClass)}>
                                <div id="kc-info-wrapper" className={clsx(props.kcInfoAreaWrapperClass)}>
                                    {infoNode}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Template;
