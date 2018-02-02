import React, { PropTypes, Component } from 'react';
import Info from 'material-ui/svg-icons/action/info';
import DataPackTableRow from './DataPackTableRow';
import BaseDialog from '../BaseDialog';

export class DataCartGeneralTable extends Component {
    constructor(props) {
        super(props);
        this.handleProviderOpen = this.handleProviderOpen.bind(this);
        this.handleProviderClose = this.handleProviderClose.bind(this);
        this.handleFormatsOpen = this.handleFormatsOpen.bind(this);
        this.handleFormatsClose = this.handleFormatsClose.bind(this);
        this.handleProjectionsOpen = this.handleProjectionsOpen.bind(this);
        this.handleProjectionsClose = this.handleProjectionsClose.bind(this);
        this.state = {
            providerName: '',
            providerDescription: '',
            providerDialogOpen: false,
            formatsDialogOpen: false,
            projectionsDialogOpen: false,
        };
    }

    handleProviderClose() {
        this.setState({ providerDialogOpen: false });
    }

    handleProviderOpen(runProviders) {
        const propsProvider = this.props.providers.find(x => x.slug === runProviders.slug);
        const providerDescription = propsProvider.service_description.toString();
        const providerName = propsProvider.name.toString();
        this.setState({ providerDescription, providerName, providerDialogOpen: true });
    }

    handleFormatsClose() {
        this.setState({ formatsDialogOpen: false });
    }

    handleFormatsOpen() {
        this.setState({ formatsDialogOpen: true });
    }

    handleProjectionsClose() {
        this.setState({ projectionsDialogOpen: false });
    }

    handleProjectionsOpen() {
        this.setState({ projectionsDialogOpen: true });
    }

    render() {
        const providers = this.props.dataPack.provider_tasks.filter(provider => (
            provider.display
        ));

        const styles = {
            tableRowInfoIcon: {
                marginLeft: '10px',
                height: '18px',
                width: '18px',
                cursor: 'pointer',
                display: 'inlineBlock',
                fill: '#4598bf',
                verticalAlign: 'middle',
            },
        };

        return (
            <div style={{ marginTop: '-5px', marginLeft: '-5px' }}>
                <DataPackTableRow
                    title="Description"
                    data={this.props.dataPack.job.description}
                />
                <DataPackTableRow
                    title="Project / Category"
                    data={this.props.dataPack.job.event}
                />
                <DataPackTableRow
                    title="Data Sources"
                    data={
                        providers.map(provider => (
                            <div key={provider.name}>
                                {provider.name}
                                <Info
                                    onTouchTap={() => this.handleProviderOpen(provider)}
                                    key={provider.description}
                                    style={styles.tableRowInfoIcon}
                                />
                                <BaseDialog
                                    show={this.state.providerDialogOpen}
                                    title={this.state.providerName}
                                    onClose={this.handleProviderClose}
                                >
                                    <div style={{ paddingTop: '20px', wordWrap: 'break-word' }}>
                                        {this.state.providerDescription}
                                    </div>
                                </BaseDialog>
                            </div>
                        ))
                    }
                />
                <DataPackTableRow
                    title="File Formats"
                    data={
                        this.props.dataPack.job.formats.map(format => (
                            <div key={format}>
                                {format}
                                <Info
                                    onTouchTap={this.handleFormatsOpen}
                                    style={styles.tableRowInfoIcon}
                                />
                                <BaseDialog
                                    className="qa-DataCartGeneralTable-BaseDialog-formats"
                                    show={this.state.formatsDialogOpen}
                                    title="Format Information"
                                    onClose={this.handleFormatsClose}
                                >
                                    <div style={{ paddingBottom: '20px', wordWrap: 'break-word' }}>
                                        EventKit provides all geospatial data in the GeoPackage (.gpkg) format.
                                            Additional format support will be added in subsequent versions.
                                    </div>
                                </BaseDialog>
                            </div>
                        ))
                    }
                />
                <DataPackTableRow
                    title="Projection"
                    data={
                        <div>
                            EPSG:4326 - World Geodetic System 1984 (WGS84)
                            <Info
                                onTouchTap={this.handleProjectionsOpen}
                                style={styles.tableRowInfoIcon}
                            />
                            <BaseDialog
                                className="qa-DataCartGeneralTable-BaseDialog-projection"
                                show={this.state.projectionsDialogOpen}
                                title="Projection Information"
                                onClose={this.handleProjectionsClose}
                            >
                                <div style={{ paddingBottom: '10px', wordWrap: 'break-word' }}>
                                    All geospatial data provided by EventKit are in the
                                        World Geodetic System 1984 (WGS 84)projection.
                                        This projection is also commonly known by its EPSG code: 4326.
                                        Additional projection support will be added in subsequent versions.
                                </div>
                            </BaseDialog>
                        </div>
                    }
                />
            </div>
        );
    }
}

DataCartGeneralTable.propTypes = {
    dataPack: PropTypes.shape({
        job: PropTypes.shape({
            description: PropTypes.string,
            event: PropTypes.string,
            formats: PropTypes.arrayOf(PropTypes.string),
        }),
        provider_tasks: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    providers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DataCartGeneralTable;
