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

const HADEAN_LOGO_BASE64 = `data:image/png;base64,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`;

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
                        <div id="kc-header-right-text">{msg("doDontHaveAccount")}</div>
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
