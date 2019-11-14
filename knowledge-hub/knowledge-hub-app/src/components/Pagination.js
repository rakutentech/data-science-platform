import React from "react";
import { Icon } from "./assets";
import CardBlock from "./CardBlock";

type Props = {
  pageNo: number,
  totalPages: number,
  totalCount: number,
  limit: number,
  onPageChange: Function
};

type State = {};

export default class Pagination extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { pager: {} };
  }

  calculatePageList(pageNo, totalPages) {
    // Paging config values
    const maxPage = 4;
    const activeRadius = 2;
    const startPageRadius = 1;
    const endPageRadius = 1;

    if (totalPages <= maxPage) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startList = [];
    const endList = [];
    const middleList = [];

    // startList
    for (let i = 1; i <= startPageRadius; i += 1) {
      startList.push(i);
    }

    // endList
    for (let i = totalPages - endPageRadius + 1; i <= totalPages; i += 1) {
      endList.push(i);
    }

    // middleList
    for (let i = pageNo - activeRadius; i <= pageNo + activeRadius; i += 1) {
      if (i > 0 && i <= totalPages) {
        middleList.push(i);
      }
    }

    // Merge and Sort
    const list = Array.from(new Set([...startList, ...middleList, ...endList]));
    list.sort((a, b) => a - b);

    // Add ...
    for (let i = 1; i < list.length; i += 1) {
      if (list[i] > list[i - 1] + 1) {
        list.splice(i, 0, { id: list[i] - 1, symbol: "…" });
        i += 1;
      } else if (list[i] > list[i - 1] + 1) {
        for (let j = list[i - 1] + 1; j < list[i]; j += 1) {
          list.splice(i, 0, j);
          i += 1;
        }
      }
    }
    return list;
  }

  render() {
    const { pageNo, totalPages, onPageChange } = this.props;
    const pages = this.calculatePageList(pageNo, totalPages);

    const left = (
      <button
        type="button"
        className="page_number pagination_btn"
        key={0}
        onClick={() => onPageChange(pageNo > 1 ? pageNo - 1 : 1)}
      >
        <Icon icon="left-arrow" class_name="pagination_arrow" />
        <div className="pagination_arrow_title">Prev</div>
      </button>
    );
    const right = (
      <button
        type="button"
        className="page_number pagination_btn"
        key={totalPages + 1}
        onClick={() => onPageChange(pageNo < totalPages ? pageNo + 1 : pageNo)}
        data-locator-id="PaginationNextButton-30280221-a22b-4559-9dbf-e55a975141a6"
      >
        <div className="pagination_arrow_title">Next</div>
        <Icon icon="right-arrow" class_name="pagination_arrow" />
      </button>
    );

    if (totalPages > 1) {
      return (
        <div
          className="outer_page_box"
          data-locator-id="Pagination-4b8c3d19-5934-4f0a-bd44-6de6e7ab2601"
        >
          <CardBlock>
            {pageNo > 1 && left}
            <span>
              {pages.map(item => {
                if (typeof item === "object") {
                  return (
                    <button
                      type="button"
                      className="page_number"
                      disabled
                      key={item.id}
                    >
                      …
                    </button>
                  );
                }
                if (item === pageNo) {
                  return (
                    <button className="page_number active" disabled key={item}>
                      {pageNo}
                    </button>
                  );
                }
                return (
                  <button
                    type="button"
                    className="page_number clickable"
                    key={item}
                    onClick={() => onPageChange(item)}>
                    {item}
                  </button>
                );
              })}
            </span>
            {pageNo < totalPages && right}
          </CardBlock>
        </div>
      );
    } else {
      return ''
    }
  }
}