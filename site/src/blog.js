import React from 'react';
import ReactDOM from 'react-dom';
import createClass from 'create-react-class';
import $ from 'jquery';
function timeSince(dateStr) {

    var date = new Date(dateStr.replace(' ', 'T'));

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

var BlogApp = createClass({

    getInitialState: function () {
        return {posts: []};
    },

    componentDidMount: function () {
        $.get('//blog.taucharts.com/content/plugins/custom-latest-posts.php', function (result) {
                this.setState({posts: result.posts});
        }.bind(this));
    },

    render: function () {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'span',
                {className: 'head'},
                'Latest blog posts'
            ),
            this.state.posts.map(function (post, index) {
                return React.createElement(
                    'p',
                    {className: 'blog-item', key: index},
                    React.createElement(
                        'a',
                        {
                            className: 'name',
                            href: post.url
                        },
                        post.title
                    ),
                    React.createElement(
                        'span',
                        {className: 'time'},
                        (timeSince(post.date) + ' ago')
                    )
                );
            })
        );
    }
});

$(function () {
    ReactDOM.render(React.createElement(BlogApp), document.getElementById('blog-holder'));
});
