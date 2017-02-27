/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { defer, omit } from 'lodash';

/**
 * Internal Dependencies
 */
import PostStore from 'lib/feed-post-store';
import PostStoreActions from 'lib/feed-post-store/actions';
import PostPlaceholder from './post-placeholder';
import PostUnavailable from './post-unavailable';
import ListGap from 'reader/list-gap';
import CrossPost from './x-post';
import RecommendedPosts from './recommended-posts';
import XPostHelper, { isXPost } from 'reader/xpost-helper';
import PostBlocked from 'blocks/reader-post-card/blocked';
import Post from './post';
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import { recordTrackForPost, recordAction } from 'reader/stats';
import {
	EMPTY_SEARCH_RECOMMENDATIONS,
	IN_STREAM_RECOMMENDATION,
} from 'reader/follow-button/follow-sources';

function EmptySearchRecommendedPosts( { post } ) {
	function handlePostClick() {
		recordTrackForPost( 'calypso_reader_recommended_post_clicked', post, {
			recommendation_source: 'empty-search',
		} );
		recordAction( 'search_page_rec_post_click' );
	}

	function handleSiteClick() {
		recordTrackForPost( 'calypso_reader_recommended_site_clicked', post, {
			recommendation_source: 'empty-search',
		} );
		recordAction( 'search_page_rec_site_click' );
	}

	const site = { title: post.site_name, };

	return (
		<div className="search-stream__recommendation-list-item" key={ post.global_ID }>
			<RelatedPostCard post={ post } site={ site }
				onSiteClick={ handleSiteClick } onPostClick={ handlePostClick } followSource={ EMPTY_SEARCH_RECOMMENDATIONS } />
		</div>
	);
}

export default class PostLifecycle extends React.PureComponent {
	static propTypes = {
		postKey: PropTypes.object,
		isDiscoverStream: PropTypes.bool
	}

	state = {
		post: this.getPostFromStore()
	}

	getPostFromStore( props = this.props ) {
		if ( props.postKey.isRecommendationBlock ) {
			return null;
		}

		const post = PostStore.get( props.postKey );
		if ( ! post || post._state === 'minimal' ) {
			defer( () => PostStoreActions.fetchPost( props.postKey ) );
		}
		return post;
	}

	updatePost = ( props = this.props ) => {
		const post = this.getPostFromStore( props );
		if ( post !== this.state.post ) {
			this.setState( { post } );
		}
	}

	componentWillMount() {
		PostStore.on( 'change', this.updatePost );
	}

	componentWillUnmount() {
		PostStore.off( 'change', this.updatePost );
	}

	componentWillReceiveProps( nextProps ) {
		this.updatePost( nextProps );
	}

	render() {
		const post = this.state.post;
		const postKey = this.props.postKey;

		if ( postKey.isRecommendationBlock ) {
			return <RecommendedPosts
				recommendations={ postKey.recommendations }
				index={ postKey.index }
				storeId={ this.props.store.id }
				followSource={ IN_STREAM_RECOMMENDATION }
				/>;
		} else if ( ! post || post._state === 'minimal' ) {
			return <PostPlaceholder />;
		} else if ( post._state === 'error' ) {
			return <PostUnavailable post={ post } />;
		} else if ( postKey.isRecommendation ) {
			return <EmptySearchRecommendedPosts post={ post } site={ postKey } />;
		} else if ( postKey.isGap ) {
			return <ListGap postKey={ postKey } store={ this.props.store } selected={ this.props.isSelected } />;
		} else if ( postKey.isBlocked ) {
			return <PostBlocked post={ post } />;
		} else if ( isXPost( post ) ) {
			const xMetadata = XPostHelper.getXPostMetadata( post );
			const xPostedTo = this.props.store.getSitesCrossPostedTo( xMetadata.commentURL || xMetadata.postURL );
			return <CrossPost
				{ ...omit( this.props, 'store' ) }
				xPostedTo={ xPostedTo }
				xMetadata={ xMetadata }
				post={ post }
				/>;
		}

		const xPostedTo = this.props.store.getSitesCrossPostedTo( post.URL );
		return <Post { ...omit( this.props, 'store' ) } post={ post } xPostedTo={ xPostedTo } />;
	}
}
