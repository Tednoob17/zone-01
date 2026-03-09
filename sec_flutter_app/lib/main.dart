import 'package:flutter/material.dart';

import 'src/theme/app_theme.dart';
import 'src/ui/pages/home_page.dart';

void main() {
	WidgetsFlutterBinding.ensureInitialized();
	runApp(const SecApp());
}

class SecApp extends StatelessWidget {
	const SecApp({super.key});

	@override
	Widget build(BuildContext context) {
		return MaterialApp(
			title: 'Secu Prog Mobile',
			debugShowCheckedModeBanner: false,
			theme: AppTheme.build(),
			home: const SecHomePage(),
		);
	}
}
