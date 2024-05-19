## Usage

### Github

Clone from github:
```bash
git clone https://github.com/Smax1988/Tic-Tac-Toe.git
```

Import the module TicTacToe and call the initialize function within a document ready. 
If you don't pass an element as first parameter to the initialize function the game will be prepended to the body element.

Example:
```javascript
import TicTacToe from './path/to' + '/src/scripts/classes/TicTacToe.js';

document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.initialize();
});
```

You can also provide an element to prepend the game by passing it to the initialize function, as shown below:
```javascript
import TicTacToe from './path/to' + '/src/scripts/classes/TicTacToe.js';

document.addEventListener('DOMContentLoaded', () => {
    let element = document.getElementById('your-element-id');
    TicTacToe.initialize(element);
});
```

If the css styles are missing, you can pass the path to the styles.css file as a second parameter to the initialize function.
Example with passing an element:
```javascript
import TicTacToe from './path/to' + '/src/scripts/classes/TicTacToe.js';

document.addEventListener('DOMContentLoaded', () => {
    let element = document.getElementById('your-element-id')
    TicTacToe.initialize(element, './path/to/src/styles/styles.css');
});
```
Example without passing an element:
```javascript
import TicTacToe from './path/to' + '/src/scripts/classes/TicTacToe.js';

document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.initialize(undefined, './path/to/src/styles/styles.css');
});
```

You can also directly include the stylesheet in the head of your html and not pass a path:
```html
<link rel="stylesheet" href="./path/to/src/styles/styles.css" />
```
```javascript
import TicTacToe from './path/to' + '/src/scripts/classes/TicTacToe.js';

document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.initialize();
});
```

### As npm package in asp.net Core project

Navigate to the project you want to use the package in:
```bash
cd path/to/your/project
```

Install the npm package:
```bash
npm install ttt-game
```
This will create a folder node_modules in the root of your project.

To be able to serve the static files of the npm package you have to copy the ttt-game folder from node_modules folder to wwwroot folder.
You can do so by copying on build. Add the following code to your xyz.csproj file:

```xml
<Target Name="CopyNodeModules" AfterTargets="Build">
	<!-- Define the destination directory path within the target -->
	<PropertyGroup>
		<DestinationDir>wwwroot/lib/ttt-game</DestinationDir>
	</PropertyGroup>
	
	<!-- Create the destination directory if it does not exist -->
	<MakeDir Directories="$(DestinationDir)" />

	<!-- Define the files to be copied from the source directory -->
	<ItemGroup>
		<SourceFiles Include="node_modules/ttt-game/**/*.*" />
	</ItemGroup>

	<Message Text="Npm Package ttt-game: Start copying node module 'ttt-game' to $(DestinationDir)." Importance="High"/>
	
	<!-- Copy the files from the source directory to the destination directory -->
	<Copy SourceFiles="@(SourceFiles)" 
		  DestinationFiles="@(SourceFiles->'$(DestinationDir)/%(RecursiveDir)%(Filename)%(Extension)')" 
		  SkipUnchangedFiles="true" 
		  Retries="3" 
		  RetryDelayMilliseconds="1000" />


	<Message Text="Npm Package ttt-game: SUCCESS: Node module 'ttt-game' successfully copied to $(DestinationDir)" Condition="'@(SourceFiles)' != ''" Importance="High" />
	<Message Text="Npm Package ttt-game: ERROR: Failed to copy node module 'ttt-game' to $(DestinationDir)." Condition="'@(SourceFiles)' == ''" Importance="High" />
</Target>
```

Import TicTacToe and call the initialize function within a document ready. Pass the path to the styles.css file as second parameter. The path shown in the example below might be different for you depending on the location where you copied the npm package to. If you chose wwwroot/lib/ttt-game (as it is shown in the XML above) you pass "../lib/ttt-game/styles/styles.css" as second parameter. 
If you omit the first parameter to the initialize function the game will be prepended to the body element.
```html
<script type="module">
    import TicTacToe from '../lib/ttt-game/scripts/ttt-game.js'; // you might have a different path here

    TicTacToe.initialize(undefined, "../lib/ttt-game/styles/styles.css"); // you might have a different path here
</script>
```

With element and path:
```html
<script type="module">
    import TicTacToe from '../lib/ttt-game/scripts/ttt-game.js'; // you might have a different path here

    let element = document.getElementById('your-element-id');
    TicTacToe.initialize(element, "../lib/ttt-game/styles/styles.css"); // you might have a different path here
</script>
```

You can also directly include the stylesheet in the head of your html and not pass a path:
```html
<link rel="stylesheet" href="./path/to/src/styles/styles.css" />
```
```html
<script type="module">
    import TicTacToe from '../lib/ttt-game/scripts/ttt-game.js'; // you might have a different path here

    TicTacToe.initialize();
</script>
```