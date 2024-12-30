import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { Button } from "@trendmicro/react-buttons";
import "./styles.scss";

class CustomDropdownToggle extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    disabled: PropTypes.bool,
    open: PropTypes.bool
  };
  static defaultProps = {
    disabled: false,
    open: false
  };

  render() {
    const {
      componentType, // eslint-disable-line
      componentClass: Component,
      noCaret,
      open,
      className,
      children,
      ...props
    } = this.props;

    if (Component === Button) {
      props.btnStyle = props.btnStyle || "flat";
      props.btnSize = props.btnSize || Button.defaultProps.btnSize;
      props.dropdownToggle = true;
    }

    const useCaret = !noCaret;
    const empty = !children && !props.title;

    return (
      <Component
        {...props}
        aria-haspopup
        aria-expanded={open}
        role="button"
        className={cx(className, {
          [styles.dropdownToggle]: true,
          [styles.btnLink]: props.btnStyle === "link", // CSS selector ".btn-link:hover .caret"
          [styles.btnLg]: props.btnSize === "lg" || props.btnSize === "large",
          [styles.btnMd]: props.btnSize === "md" || props.btnSize === "medium",
          [styles.btnSm]: props.btnSize === "sm" || props.btnSize === "small",
          [styles.btnXs]:
            props.btnSize === "xs" || props.btnSize === "extra-small",
          [styles.empty]: empty
        })}
      >
        {children || props.title}
        {useCaret && <span className={styles.caret} />}
      </Component>
    );
  }
}

export default CustomDropdownToggle;
