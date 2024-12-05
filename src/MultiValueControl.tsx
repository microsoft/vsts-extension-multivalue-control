import { Checkbox } from "office-ui-fabric-react/lib/components/Checkbox";

import { TextField } from "office-ui-fabric-react/lib/components/TextField";
import {
  FocusZone,
  FocusZoneDirection,
} from "office-ui-fabric-react/lib/FocusZone";
import * as React from "react";

import { DelayedFunction } from "VSS/Utils/Core";
import { BrowserCheckUtils } from "VSS/Utils/UI";
import { initializeTheme } from "./theme"


import { Button } from "office-ui-fabric-react";


interface IMultiValueControlProps {
  selected?: string[];
  width?: number;
  readOnly?: boolean;
  placeholder?: string;
  noResultsFoundText?: string;
  searchingText?: string;
  onSelectionChanged?: (selection: string[]) => Promise<void>;
  forceValue?: boolean;
  options: string[];
  error: JSX.Element;
  onBlurred?: () => void;
  onResize?: () => void;
}

interface IMultiValueControlState {
  focused: boolean;
  filter: string;
  multiline: boolean;
  isToggled: boolean;
}

export class MultiValueControl extends React.Component<
  IMultiValueControlProps,
  IMultiValueControlState
> {
  
  private readonly _unfocusedTimeout = BrowserCheckUtils.isSafari() ? 2000 : 1;
  private readonly _allowCustom: boolean =
    VSS?.getConfiguration()?.witInputs?.AllowCustom || false;
  private readonly _labelDisplayLength: number =
    VSS?.getConfiguration()?.witInputs?.LabelDisplayLength || 35;
  private _setUnfocused = new DelayedFunction(
    null,
    this._unfocusedTimeout,
    "",
    () => {
      this.setState({ focused: false, filter: "" });
    }
  );
  constructor(props, context) {
    super(props, context);
    this.state = { focused: false, filter: "", multiline: false , isToggled: false,};
  }
  toggleIcon = () => {
    this.setState((prevState) => ({
      isToggled: !prevState.isToggled,
    }));
  };
  public render() {
    const { focused } = this.state;

    


  

    const data = (this.props.selected || []).map((text) => {
      return text.length > Number(this._labelDisplayLength)
        ? `${text.slice(0, Number(this._labelDisplayLength))}...`
        : text;
    });



    return (
      <div style={{width: "100%"  }}>
         
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
            margin: 3,
          }}
        >
          {data?.map((t, index) => {
            return (
              <div className="container">
                <div>{t.match(/.{1,50}/g)?.join("\n")}</div>
                <div
                  className="close-icon"
                  onClick={() => this.deleteTags(t, data)}
                >
                  X
                </div>
              </div>
            );
          })}

         <Button
        primary={false}
        iconProps={{ iconName: data.length ? "" : undefined  }}
        ariaLabel="ADD"
     
        onClick={this.toggleIcon}
        text={data.length ? undefined : "Add"}
        style={{ margin: 5}}

      />       
        </div>
     
        <div className={`multi-value-control ${focused ? "focused" : ""}`}>
          {this.state.isToggled ? this._getOptions() : null}
          <div className="error">{this.props.error}</div>
        </div>
       
      </div>
    );
  }

  public componentDidUpdate() {
    if (this.props.onResize) {
      this.props.onResize();
    }
  }

  componentDidMount() {
    initializeTheme()
  }

  private _getOptions() {
    const options = this.props.options;
    const selected = (this.props.selected || []).slice(0);
    const filteredOpts = this._filteredOptions();

    return (
      <div className="options">
        <TextField
         className="text"
          value={this.state.filter}
          autoFocus
          placeholder={"Filter values"}
          onKeyDown={this._onInputKeyDown}
          onBlur={this._onBlur}
          onFocus={this._onFocus}
          onChange={this._onInputChange}
          multiline={this.state.multiline}
        />
        <FocusZone direction={FocusZoneDirection.vertical}>
          {this.state.filter ? null : (
            <Checkbox
             className="text"
              label="Select All"
              checked={selected.join(";") === options.join(";")}
              onChange={this._toggleSelectAll}
              inputProps={{
                onBlur: this._onBlur,
                onFocus: this._onFocus,
              }}
            />
          )}
          {filteredOpts.map((o) => (
            <Checkbox
            className="text"
              checked={selected.indexOf(o) >= 0}
              inputProps={{
                onBlur: this._onBlur,
                onFocus: this._onFocus,
              }}
              onChange={() => this._toggleOption(o)}
              label={this._wrapText(o)}
              title={o}
            />
          ))}
        </FocusZone>
      </div>
    );
  }

  private _wrapText(text: string) {
    return text.length > this._labelDisplayLength
      ? `${text.slice(0, this._labelDisplayLength)}...`
      : text;
  }
  private _onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.altKey || e.shiftKey || e.ctrlKey) {
      return;
    }

    if (e.keyCode === 13 /* enter */) {
      const filtered = this._filteredOptions();

      e.preventDefault();
      e.stopPropagation();
      this._toggleOption(filtered[0]);
      this.setState({ filter: "" });
    }
    if (e.keyCode === 37 /* left arrow */) {
      const input: HTMLInputElement = e.currentTarget;
      if (
        input.selectionStart !== input.selectionEnd ||
        input.selectionStart !== 0
      ) {
        return;
      }
      const tags = document.querySelectorAll(
        "#container .multi-value-control .tag-picker [data-selection-index]"
      );
      if (tags.length === 0) {
        return;
      }
      const lastTag = tags.item(tags.length - 1) as HTMLDivElement;
      lastTag.focus();
      e.preventDefault();
      e.stopPropagation();
    }
  };
  private _toggleSelectAll = () => {
    const options = this.props.options;
    const selected = this.props.selected || [];
    if (selected.join(";") === options.join(";")) {
      this._setSelected([]);
    } else {
      this._setSelected(options);
    }
    this._ifSafariCloseDropdown();
  };
  private _filteredOptions = (): string[] => {
    const filter = this.state.filter.toLocaleLowerCase();
    const opts = this._mergeStrArrays([
      this.props.options,
      this.props.selected || [],
    ]);

    const filtered = [
      ...opts.filter((o) => o.toLocaleLowerCase().indexOf(filter) === 0),
      ...opts.filter((o) => o.toLocaleLowerCase().indexOf(filter) > 0),
    ];

    const filterEmptyElement = this._allowCustom
      ? [this.state.filter, ...filtered]
      : filtered;

    return filterEmptyElement.filter((el) => el !== "");
  };
  private _onInputChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    let isMultiline = this.state.multiline;
    if (newValue != undefined) {
      const newMultiline = newValue.length > 50;
      if (newMultiline !== this.state.multiline) {
        isMultiline = newMultiline;
      }
    }
    this.setState({ filter: newValue || "", multiline: isMultiline });
  };
  private _onBlur = () => {
    this._setUnfocused.reset();
  };
  private _onFocus = () => {
    this._setUnfocused.cancel();
  };
  private _setSelected = async (selected: string[]): Promise<void> => {
    if (!this.props.onSelectionChanged) {
      return;
    }
    await this.props.onSelectionChanged(selected);
  };
  private _mergeStrArrays = (arrs: string[][]): string[] => {
    const seen: { [str: string]: boolean } = {};
    const merged: string[] = [];
    for (const arr of arrs) {
      for (const ele of arr) {
        if (!seen[ele]) {
          seen[ele] = true;
          merged.push(ele);
        }
      }
    }
    return merged;
  };
  private _toggleOption = (option: string): boolean => {
    const selectedMap: { [k: string]: boolean } = {};
    for (const s of this.props.selected || []) {
      selectedMap[s] = true;
    }
    const change =
      option in selectedMap || this.props.options.indexOf(option) >= 0;
    selectedMap[option] = !selectedMap[option];
    const selected = this._mergeStrArrays([
      this.props.options,
      this.props.selected || [],
      [option],
    ]).filter((o) => selectedMap[o]);
    this._setSelected(selected);
    this._ifSafariCloseDropdown();
    return change;
  };
  private _ifSafariCloseDropdown() {
    if (BrowserCheckUtils.isSafari()) {
      this.setState({ filter: "", focused: false });
    }
  }

  private deleteTags = (tag: string, data: string[]) => {
    const updatedTags = data.filter((t) => t !== tag);
    if (this.props.onSelectionChanged) {
      this.props.onSelectionChanged(updatedTags);
    }
  };
}
