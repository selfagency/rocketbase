/// <reference path="../../pb_data/types.d.ts" />

// Cron job to permanently delete pages and posts that have been in trash for 30+ days
// Runs daily at 2:00 AM
cronAdd('trash-cleanup', '0 2 * * *', function () {
  console.log('[Trash Cleanup] Starting trash cleanup cron job');

  try {
    // Calculate the date 30 days ago
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    var thirtyDaysAgoISO = thirtyDaysAgo.toISOString().replace('T', ' ').slice(0, 19);

    console.log('[Trash Cleanup] Deleting items trashed before:', thirtyDaysAgoISO);

    // Find and delete pages that have been in trash for 30+ days
    var pagesCollection = $app.findCollectionByNameOrId('pages');
    if (pagesCollection) {
      var stalePagesFilter = 'in_trash = true && updated <= "' + thirtyDaysAgoISO + '"';
      var stalePages = arrayOf(new DynamicModel({ id: '', updated: '' }));

      try {
        $app.findRecordsByFilter('pages', stalePagesFilter, '-updated', 500, 0, function (record) {
          stalePages.push(record);
        });

        var pagesDeleted = 0;
        for (var i = 0; i < stalePages.length; i++) {
          try {
            $app.delete(stalePages[i]);
            pagesDeleted++;
          } catch (err) {
            console.error('[Trash Cleanup] Failed to delete page:', stalePages[i].id, err);
          }
        }

        console.log('[Trash Cleanup] Deleted', pagesDeleted, 'pages from trash');
      } catch (err) {
        console.error('[Trash Cleanup] Error processing pages:', err);
      }
    }

    // Find and delete posts that have been in trash for 30+ days
    var postsCollection = $app.findCollectionByNameOrId('posts');
    if (postsCollection) {
      var stalePostsFilter = 'in_trash = true && updated <= "' + thirtyDaysAgoISO + '"';
      var stalePosts = arrayOf(new DynamicModel({ id: '', updated: '' }));

      try {
        $app.findRecordsByFilter('posts', stalePostsFilter, '-updated', 500, 0, function (record) {
          stalePosts.push(record);
        });

        var postsDeleted = 0;
        for (var j = 0; j < stalePosts.length; j++) {
          try {
            $app.delete(stalePosts[j]);
            postsDeleted++;
          } catch (err) {
            console.error('[Trash Cleanup] Failed to delete post:', stalePosts[j].id, err);
          }
        }

        console.log('[Trash Cleanup] Deleted', postsDeleted, 'posts from trash');
      } catch (err) {
        console.error('[Trash Cleanup] Error processing posts:', err);
      }
    }

    console.log('[Trash Cleanup] Trash cleanup completed successfully');
  } catch (err) {
    console.error('[Trash Cleanup] Fatal error during trash cleanup:', err);
  }
});

console.log('[Hooks] Trash cleanup cron job initialized (runs daily at 2:00 AM)');
