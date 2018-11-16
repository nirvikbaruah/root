import React from "react";
import { connect } from "react-redux";
import { IAdminWrapperProps, IAdminProps } from "./types";
import Loading from "../Loading/Loading";
import { getApplicationList, setApplicationStatus, setSelectedForm } from "../store/admin/actions";
import ReactTable from "react-table";
import { get, values } from "lodash-es";
import 'react-table/react-table.css';
import { STATUS, TYPE } from "../constants";
import { IAdminState } from "../store/admin/types";
import ApplicationView from "./ApplicationView";

const defaultFilterMethod = (filter, row) => {
    if (filter.value == "all") {
        return true;
    }
    return row[filter.id] == filter.value;
};

const createFilterSelect = (values) => ({ filter, onChange }) =>
    <select
        className="form-control"
        value={filter ? filter.value : "all"}
        onChange={event => onChange(event.target.value)}
    >
        {values.map(e =>
            <option key={e}>{e}</option>
        )}
        <option>all</option>
    </select>;

const Admin = (props: IAdminProps) => {
    const columns = [
        {
            "Header": "Preview",
            "accessor": "_id",
            "Cell": (p) => <div onClick={(e) => {
                e.preventDefault(); props.setSelectedForm && props.setSelectedForm({ "id": p.value, "name": "application_info" })
            }}><a href="#">View</a></div>
        },
        {
            "Header": "ID",
            "accessor": "_id"
        },
        {
            "Header": "email",
            "accessor": "user.email"
        },
        {
            "Header": "type",
            "filterMethod": defaultFilterMethod,
            "Filter": createFilterSelect(values(TYPE)),
            "accessor": "type"
        },
        {
            "Header": "Location",
            "accessor": "location"
        },
        {
            "Header": "Status",
            "accessor": "status",
            "filterMethod": defaultFilterMethod,
            "Filter": createFilterSelect(values(STATUS)),
            "Cell": (props) => <div>{props.value}</div>
        },
        {
            "Header": "Number of Reviews",
            "id": "reviews",
            "accessor": e => e.reviews.length,
            "filterMethod": defaultFilterMethod,
            "Filter": createFilterSelect([0, 1, 2, 3])
        },
        {
            "Header": "culture fit",
            "id": "cultureFit",
            "accessor": e => e.reviews.map(e => e["cultureFit"]).join(", ")
        },
        {
            "Header": "experience",
            "id": "experience",
            "accessor": e => e.reviews.map(e => e["experience"]).join(", ")
        },
        {
            "Header": "passion",
            "id": "passion",
            "accessor": e => e.reviews.map(e => e["passion"]).join(", ")
        },
        {
            "Header": "is organizer",
            "id": "isOrganizer",
            "accessor": e => e.reviews.map(e => e["isOrganizer"] ? "yes" : "no").join(", ")
        },
        {
            "Header": "is beginner",
            "id": "isBeginner",
            "accessor": e => e.reviews.map(e => e["isBeginner"] ? "yes" : "no").join(", ")
        }
    ];
    return (
        <div>
            <h3>Applications:</h3>
            <div className="bg-white col-8 offset-2 p-4">
                <ReactTable filterable columns={columns} data={props.applicationList} minRows={0}>
                    {(state, makeTable, instance) => {
                        return (
                            <div>
                                User emails shown:
                            <input type="text"
                                    readOnly
                                    value={state.sortedData.map(e => e && get(e, "user.email")).join(",")}
                                    style={{ width: "100%" }}
                                />
                                {makeTable()}
                            </div>
                        );
                    }}
                </ReactTable>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    ...(state.admin as IAdminState)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    getApplicationList: () => dispatch(getApplicationList()),
    setApplicationStatus: (a, b) => dispatch(setApplicationStatus(a, b)),
    setSelectedForm: e => dispatch(setSelectedForm(e))
});

class AdminWrapper extends React.Component<IAdminWrapperProps, {}> {
    componentDidMount() {
        this.props.getApplicationList();
    }
    render() {
        if (!this.props.applicationList) {
            return <Loading />;
        }
        return <div>
            <Admin applicationList={this.props.applicationList} setSelectedForm={e => this.props.setSelectedForm(e)} />
            {this.props.selectedForm && <ApplicationView />}
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminWrapper);