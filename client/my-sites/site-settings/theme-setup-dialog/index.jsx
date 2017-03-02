/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import PulsingDot from 'components/pulsing-dot';
import { getSelectedSite } from 'state/ui/selectors';
import { closeDialog, runThemeSetup } from 'state/ui/theme-setup/actions';

class ThemeSetupDialog extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			confirmDeleteInput: '',
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isDialogVisible !== nextProps.isDialogVisible ) {
			this.setState( {
				confirmDeleteInput: '',
			} );
		}
	}

	onInputChange = ( event ) => {
		this.setState( {
			confirmDeleteInput: event.target.value,
		} );
	}

	renderButtons( deleteConfirmed, { onThemeSetupClick, site, saveExisting, isActive, result, translate } ) {
		const onClickDeleteContent = () => onThemeSetupClick( false, site.ID );
		const deleteContent = (
			<Button
				primary
				scary
				disabled={ ! deleteConfirmed }
				onClick={ onClickDeleteContent }>
				{ translate( 'Set Up And Delete Content' ) }
			</Button>
		);
		const keepContent = {
			action: 'keep-content',
			label: translate( 'Set Up Your Theme' ),
			isPrimary: true,
			onClick: () => onThemeSetupClick( true, site.ID ),
		};
		const cancel = {
			action: 'cancel',
			label: translate( 'Cancel' ),
		};
		const backToSetup = {
			action: 'back-to-setup',
			label: translate( 'Back To Setup' ),
			disabled: isActive,
		};
		const viewSite = {
			action: 'view-site',
			label: translate( 'View Site' ),
			isPrimary: true,
			disabled: isActive,
			onClick: () => page( site.URL ),
		};

		if ( isActive || 'success' === result.result ) {
			return [
				backToSetup,
				viewSite
			];
		}

		if ( saveExisting ) {
			return [
				cancel,
				keepContent,
			];
		}
		return [
			cancel,
			deleteContent,
		];
	}

	renderContent( deleteConfirmed, { isActive, result, saveExisting, site, translate } ) {
		const keepContent = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>
					{ translate( 'Settings will be changed on {{strong}}%(site)s{{/strong}}, and these changes will be live immmediately. Do you want to proceed?', {
						components: {
							strong: <strong />,
						},
						args: {
							site: site.domain,
						}
					} ) }
				</p>
			</div>
		);
		const deleteContent = (
			<div>
				<h1>{ translate( 'Confirm Theme Setup' ) }</h1>
				<p>
					{ translate( 'Please type {{warn}}delete{{/warn}} into the field below to confirm. {{strong}}All content on %(site)s will be deleted{{/strong}}, and then your site will be set up. These changes will be live immediately.', {
						components: {
							warn: <span className="theme-setup-dialog__confirm-text"/>,
							strong: <strong />,
						},
						args: {
							site: site.domain,
						},
					} ) }
				</p>
				<FormFieldset>
					<FormTextInput
						autoCapitalize={ false }
						autoComplete={ false }
						autoCorrect={ false }
						onChange={ this.onInputChange }
						value={ this.state.confirmDeleteInput } />
					<FormInputValidation
						isError={ ! deleteConfirmed }
						text={ deleteConfirmed
							? translate( 'Text matches.' )
							: translate( 'Text does not match.' ) } />
				</FormFieldset>
			</div>
		);
		const loading = (
			<div>
				<PulsingDot active={ true } />
			</div>
		);
		const success = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>
					{ translate( 'Success! Your theme is all set up like the demo.' ) }
				</p>
			</div>
		);
		const failure = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>
					{ translate( 'We encountered a problem – would you like to try again?' ) }
				</p>
			</div>
		);
		if ( isActive ) {
			return loading;
		}
		if ( result ) {
			return ( 'success' === result.result ) ? success : failure;
		}
		return ( saveExisting ) ? keepContent : deleteContent;
	}

	render() {
		const deleteConfirmed = 'delete' === this.state.confirmDeleteInput;
		return (
			<Dialog className="theme-setup-dialog"
				isVisible={ this.props.isDialogVisible }
				buttons={ this.renderButtons( deleteConfirmed, this.props ) }
				onClose={ this.props.isActive ? null : this.props.closeDialog }>
				{ this.renderContent( deleteConfirmed, this.props ) }
			</Dialog>
		);
	}
}

ThemeSetupDialog = localize( ThemeSetupDialog );

const mapStateToProps = ( state ) => {
	const isDialogVisible = state.ui.themeSetup.isDialogVisible;
	const isActive = state.ui.themeSetup.active;
	const result = state.ui.themeSetup.result;
	const saveExisting = state.ui.themeSetup.saveExisting;
	const site = getSelectedSite( state );
	return {
		isDialogVisible,
		isActive,
		result,
		saveExisting,
		site,
	};
};

export default connect( mapStateToProps, { closeDialog, onThemeSetupClick: runThemeSetup } )( ThemeSetupDialog );

