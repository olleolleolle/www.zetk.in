import React from 'react';
import { FormattedMessage as Msg } from 'react-intl';

import Link from '../misc/FormattedLink';
import LoadingIndicator from '../misc/LoadingIndicator';


export default class ActionList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            maxVisible: 4,
        };
    }

    render() {
        let actionList = this.props.actionList;

        if (actionList.get('isPending')) {
            return <LoadingIndicator/>
        }
        else if (actionList.get('error')) {
            // TODO: Proper error message
            return <span>ERROR!</span>;
        }
        else if (actionList.get('items')) {
            let moreLink;
            let maxVisible = this.state.maxVisible;
            let actions = actionList.get('items');

            if (maxVisible && actions.size > maxVisible) {
                let numExtra = actions.size - maxVisible;
                actions = actions.slice(0, maxVisible);

                moreLink = (
                    <Link msgId="dashboard.events.more"
                        msgValues={{ numExtra }}
                        onClick={ this.onClickMore.bind(this) }/>
                );
            }

            return (
                <div className="ActionList">
                    <ul>
                    { actions.map(item => (
                        <ActionListItem key={ item.get('id') }
                            action={ item }/>
                    ))}
                    </ul>
                    { moreLink }
                </div>
            );
        }
        else {
            return null;
        }
    }

    onClickMore(ev) {
        this.setState({
            maxVisible: undefined,
        });
    }
}

const ActionListItem = props => {
    let action = props.action;
    let activity = action.getIn(['activity', 'title']);
    let startTime = Date.create(action.get('start_time'),
        { fromUTC: true, setUTC: true });

    return (
        <li className="ActionListItem">
            <span className="ActionListItem-dateTime">
                { startTime.format('{d}/{M} {HH}:{mm}') }</span>
            <span className="ActionListItem-activity">{ activity }</span>
        </li>
    );
};
