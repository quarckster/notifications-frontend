import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    CardHeader,
    Checkbox,
    List,
    ListItem,
    Card,
    CardBody,
    Stack,
    StackItem
} from '@patternfly/react-core';

import { RadioToggle, ALL, SELECTED } from 'PresentationalComponents';
import _ from 'lodash';

export class FilterList extends Component {
    static propTypes = {
        apps: PropTypes.object.isRequired,
        filter: PropTypes.object
    };

    constructor(props) {
        super(props);
        const initialState = { selected: {
            appIds: {}, levelIds: {}, eventTypeIds: {}
        }};

        this.state = initialState;
    }

    static getDerivedStateFromProps(props, state) {
        return FilterList.fillMissingSelection(props, state);
    }

    static fillMissingSelection = (props, state) => {
        let stateCopy = state;
        let filter = props.filter;

        if (filter) {
            [ 'app', 'eventType', 'level' ].forEach((kind) => {
                const dict = filter[kind + 's'];
                if (dict) {
                    const key = kind + 'Ids';
                    Object.values(dict).forEach((entry) => {
                        if (stateCopy.selected[key][entry.id] === undefined) {
                            stateCopy.selected[key][entry.id] = true;
                        }
                    });
                }
            });
        }

        return stateCopy;
    }

    componentDidMount() {
        const stateCopy = FilterList.fillMissingSelection(this.props, this.state);
        this.setState(stateCopy);
    }

    renderLevel = (level) =>
        level.attributes &&
            <ListItem key={ `level-${ level.id}` }>
                <Checkbox id={ `level-check-${ level.id}` }
                    data-event-type-id={ level.id }
                    label={ level.attributes.title }
                    aria-label={ level.attributes.title }
                    onChange={ () => this.selectFilter('levelIds', level.id) }
                    defaultChecked={ this.state.selected.levelIds[level.id] } />
            </ListItem>;

    renderLevels = (levels) => {
        const levelsArray = _.values(levels);
        return levelsArray.length > 0 &&
            <List>
                { levelsArray.map((level) =>
                    this.renderLevel(level)
                ) }
            </List>;
    }

    eventTypesListItem = (eventType) =>
        eventType.attributes &&
            <ListItem key={ `event-type-${ eventType.id}` }>
                <Checkbox id={ `event-type-check-${ eventType.id}` }
                    data-event-type-id={ eventType.id }
                    label={ eventType.attributes.name }
                    aria-label={ eventType.attributes.name }
                    onChange={ () => this.selectFilter('eventTypeIds', eventType.id) }
                    defaultChecked={ this.state.selected.eventTypeIds[eventType.id] } />
                { this.state.selected.eventTypeIds[eventType.id] &&
                      this.renderLevels(eventType.levels) }
            </ListItem>;

    eventTypesList = (eventTypes) => {
        const eventTypesArray = _.values(eventTypes);
        return eventTypesArray.length > 0 &&
            <List>
                { eventTypesArray.map((eventType) =>
                    this.eventTypesListItem(eventType)
                ) }
            </List>;
    }

    selectFilter = (arrayName, id) => {
        let newState = { ...this.state };
        newState.selected[arrayName][id] = newState.selected[arrayName][id] ? false : true;
        this.setState(newState);
    }

    render() {
        const apps = _.values(this.props.apps);

        return (<Stack gutter="md">
            { apps.map((app) =>
                <StackItem key={ `app-item-${ app.id }` }>
                    <Card key={ `app-${ app.id }` }>
                        <CardHeader>
                            <Checkbox id={ `app-check-${ app.id}` }
                                data-event-type-id={ app.id }
                                label={ app.attributes.name }
                                aria-label={ app.attributes.name }
                                onChange={ () => this.selectFilter('appIds', app.id) }
                                defaultChecked={ this.state.selected.appIds[app.id]  } />
                        </CardHeader>
                        { this.state.selected.appIds[app.id] &&
                            <CardBody>
                                <RadioToggle
                                    scope={ `app-${ app.id }` }
                                    selectable={ Object.keys(app.eventTypes).length > 0 }
                                    initial={ Object.keys(app.eventTypes).some((id) => this.state.selected.eventTypeIds[id]) ? SELECTED : ALL }>
                                    { this.eventTypesList(app.eventTypes, app.id) }
                                </RadioToggle>
                            </CardBody> }
                    </Card>
                </StackItem>
            ) }
        </Stack>);
    }
}

export default FilterList;
