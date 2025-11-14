# voterAccess
OK guys, here is the breakdown on how to push create branches and use github overall.

Ok so basically whenever you want to make changes on github you want to first make a branch before you make any changes
that way this branch has all the changes we want to include and does not corrupt the main file.

what you might want to do first is in the terminal

git status      # See changes and current branch
git branch      # See which branch you’re on

then to create a new branch

(when creating a branch in general make sure to get the updated version of the main that you want to make a copy of) git pull origin main

git checkout -b my-feature   # Creates and switches to a new branch (change the my-feature part to your branch name)

but what if you want to switch between branches because you have a ton of them, have no fear use this

git checkout branch-name

now lets say you finished all your work and you want to just save them and commit them to the github then you

git add .                        # Stage all changes
git commit -m "Describe changes" # Commit changes

then sync with github 
git pull origin branch-name --rebase

and then push
git push -u origin branch-name

-u sets the remote as the default for future pushes. After this, you can just do **git push** next time.

you should then see your branch update on to the github website and stuff, if anything goes wrong chatgbt this shit

IN SUMMARY

git branch → check which branch 

git checkout main → switch to main branch

git pull origin main --rebase → sync with GitHub

git checkout -b new-feature → create branch (if needed)

Make changes locally

git add . → stage changes

git commit -m "message" → commit changes

git push -u origin new-feature → upload to GitHub

after you push you should discard the branch or just keep track of what you are pushing to main or else you might come across problem but nothing chat cant solve with stashing ok.

git checkout main
git pull origin main
git merge --no-ff branch-to-close





