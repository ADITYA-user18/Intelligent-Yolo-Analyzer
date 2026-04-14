import os
import shutil
from pathlib import Path

class YOLOStandardizer:
    def __init__(self, source_path, output_path, class_names=None):
        self.source = Path(source_path)
        self.output = Path(output_path)
        self.class_names = class_names or []
        self.image_exts = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}

    def convert(self, include_test=False):
        # 1. Create Clean Structure
        splits = ['train', 'val']
        if include_test:
            splits.append('test')
        
        for s in splits:
            (self.output / 'images' / s).mkdir(parents=True, exist_ok=True)
            (self.output / 'labels' / s).mkdir(parents=True, exist_ok=True)

        # 2. Find files
        images = []
        for root, _, files in os.walk(self.source):
            if '__MACOSX' in root: continue
            for f in files:
                if Path(f).suffix.lower() in self.image_exts:
                    images.append(Path(root) / f)

        images.sort()
        total = len(images)
        
        # 3. Determine split indices
        if include_test:
            train_end = int(total * 0.7)
            val_end = int(total * 0.9)
        else:
            train_end = int(total * 0.8)
            val_end = total

        # 4. Copy files
        for i, img_path in enumerate(images):
            if i < train_end:
                subset = 'train'
            elif i < val_end:
                subset = 'val'
            else:
                subset = 'test'
            
            new_name = f"frame_{i}"
            # Copy Image
            shutil.copy(img_path, self.output / 'images' / subset / f"{new_name}{img_path.suffix}")
            
            # Copy Label
            label_path = img_path.with_suffix('.txt')
            target_label = self.output / 'labels' / subset / f"{new_name}.txt"
            if label_path.exists():
                shutil.copy(label_path, target_label)
            else:
                open(target_label, 'a').close()

        # 5. Generate YAML
        self.generate_yaml(include_test)
        
        return str(self.output)

    def generate_yaml(self, include_test=False):
        import yaml
        data = {
            'path': '.', # root in the zip
            'train': 'images/train',
            'val': 'images/val',
            'nc': len(self.class_names),
            'names': self.class_names
        }
        if include_test:
            data['test'] = 'images/test'
            
        with open(self.output / 'data.yaml', 'w') as f:
            yaml.dump(data, f, sort_keys=False)