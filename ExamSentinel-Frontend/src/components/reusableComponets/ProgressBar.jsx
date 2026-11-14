import React from "react";
import classNames from "classnames";

const ProgressBar = ({ value = 0, className = "" }) => {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={classNames(
        "w-full h-2 bg-muted rounded-full overflow-hidden",
        className
      )}
    >
      <div
        className={classNames(
          "h-full transition-all duration-500",
          value <= 100 && value >= 0 ? "bg-primary" : "bg-red-500"
        )}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;
