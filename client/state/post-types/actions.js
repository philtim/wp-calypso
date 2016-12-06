/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	POST_TYPES_RECEIVE,
	POST_TYPES_REQUEST,
	POST_TYPES_REQUEST_SUCCESS,
	POST_TYPES_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that post types for a site
 * have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Array}  types  Post types received
 * @return {Object}        Action object
 */
export function receivePostTypes( siteId, types ) {
	return {
		type: POST_TYPES_RECEIVE,
		siteId,
		types
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve post types for a site.
 *
 * @param  {Number}   siteId Site ID
 * @return {Function}        Action thunk
 */
export function requestPostTypes( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_TYPES_REQUEST,
			siteId
		} );

		return wpcom.undocumented().site( siteId ).postTypes().then( ( data ) => {
			dispatch( receivePostTypes( siteId, data ) );
			dispatch( {
				type: POST_TYPES_REQUEST_SUCCESS,
				siteId
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: POST_TYPES_REQUEST_FAILURE,
				siteId,
				error
			} );
		} );
	};
}
