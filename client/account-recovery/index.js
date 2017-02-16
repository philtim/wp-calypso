/**
 * Internal dependencies
 */
import {
	lostPassword,
	forgotUsername,
	resetPassword,
	resetPasswordEmailForm,
	resetPasswordByTransactionId,
	redirectLoggedIn
} from './controller';

export default function( router ) {
	// Main route for account recovery is the lost password page
	router( '/account-recovery', redirectLoggedIn, lostPassword );
	router( '/account-recovery/forgot-username', redirectLoggedIn, forgotUsername );
	router( '/account-recovery/reset-password', redirectLoggedIn, resetPassword );
	router( '/account-recovery/reset-password/email-form', redirectLoggedIn, resetPasswordEmailForm );
	router( '/account-recovery/reset-password/transaction-id', redirectLoggedIn, resetPasswordByTransactionId );
}
