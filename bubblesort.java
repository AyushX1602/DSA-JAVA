//brute froce approach

// public class bubblesort{
//     public static void Print (int[] arr) {
//         for (int ele : arr){
//             System.out.print(ele+" ");
//         }
//         System.out.println();
//     }
//     public static void main(String[] args) {
//         int[] arr ={2,5,1,8,3,0,-9};
//         int n = arr.length;
//         Print(arr);
//         for(int i=0 ; i<n-1 ; i++){
//         for(int j=0;j<n-1-i;j++){
//             if(arr[j]>arr[j+1]){
//                int temp =arr[j];
//                arr[j] =arr[j+1];
//                arr[j+1] = temp;

//             }
//         }}
//           Print(arr);
//   }
// }



//optimized approach


// public class bubblesort{
//     public static void Print (int[] arr) {
//         for (int ele : arr){
//             System.out.print(ele+" ");
//         }
//         System.out.println();
//     }
//     public static void main(String[] args) {
//         int[] arr ={2,5,1,8,3,0,-9};
//         int n = arr.length;
//         Print(arr);
//         for(int i=0 ; i<n-1 ; i++){
//             int swaps =0;
//         for(int j=0;j<n-1-i;j++){
//             if(arr[j]>arr[j+1]){
//                int temp =arr[j];
//                arr[j] =arr[j+1];
//                arr[j+1] = temp;
//                 swaps++;
//             }
//         }
//     if(swaps==0){
//         break;
//     }
         
//   } 
//   Print(arr);
//     }
// }



// Reverse Bubble Sort

// public class bubblesort{
//     public static void Print (int[] arr) {
//         for (int ele : arr){
//             System.out.print(ele+" ");
//         }
//         System.out.println();
//     }
//     public static void main(String[] args) {
//         int[] arr ={2,5,1,8,3,0,-9};
//         int n = arr.length;
//         Print(arr);
//         for(int i=0; i<n-1 ; i++){
//         for(int j=0;j<n-1;j++){
//             if(arr[j]<arr[j+1]){
//                int temp =arr[j];
//                arr[j] =arr[j+1];
//                arr[j+1] = temp;

//             }
//         }}
//           Print(arr);
//   }
// }




// selection sort

// public class bubblesort{

//         public static void Print (int[] arr) {
//         for (int ele : arr){
//             System.out.print(ele+" ");
//         }
//         System.out.println();
//     }
//     public static void main(String[] args) {
//         int [] arr = {2,9,10,-7,5,3};
//         int n = arr.length;
//         Print (arr);
//         for(int i=0;i<n;i++){
//             int min= Integer.MAX_VALUE, mnidx=-1;
        
        
//         for(int j=i;j<n;j++){
//             if(arr[j]<min){
//                 min= arr[j];
//                 mnidx = j;
//             }
//         }
//         int temp = arr[i];
//         arr[i] = arr[mnidx];
//         arr[mnidx] = temp;
//     }
//     Print(arr);
// }
// }




//reverse selection sort 





// public class bubblesort{

//         public static void Print (int[] arr) {
//         for (int ele : arr){
//             System.out.print(ele+" ");
//         }
//         System.out.println();
//     }
//     public static void main(String[] args) {
//         int [] arr = {2,9,10,-7,5,3};
//         int n = arr.length;
//         Print (arr);
//         for(int i=0;i<n-1;i++){
//             int max= Integer.MIN_VALUE, maxidx=-1;
        
        
//         for(int j=i;j<n;j++){
//             if(arr[j]>max){
//                 max= arr[j];
//                 maxidx = j;
//             }
//         }
//         int temp = arr[i];
//         arr[i] = arr[maxidx];
//         arr[maxidx] = temp;
//     }
//     Print(arr);
// }
// }









// // Insertion Sort


// public class bubblesort{

//         public static void Print (int[] arr) {
//         for (int ele : arr){
//             System.out.print(ele+" ");
//         }
//         System.out.println();
//     }
//     public static void main(String[] args) {
//         int [] arr = {2,9,10,-7,5,3};
//         int n = arr.length;
//         Print (arr);
//         for(int i=0;i<n-1;i++){
//             int j = i;
//             while(j>0 && arr[j]<arr[j-1])
//             {
//                 int temp = arr [j];
//                 arr[j] = arr[j-1];
//                 arr[j-1] = temp;
//                 j--;
//             }
//     }
//     Print(arr);
// }
// }



// Insertion Sort - Descending

public class bubblesort{

        public static void Print (int[] arr) {
        for (int ele : arr){
            System.out.print(ele+" ");
        }
        System.out.println();
    }
    public static void main(String[] args) {
        int [] arr = {2,9,10,-7,5,3};
        int n = arr.length;
        Print (arr);
        for(int i=1; i<n; i++){
            int j = i;
            while(j>0 && arr[j]>arr[j-1])  
            {
                int temp = arr [j];
                arr[j] = arr[j-1];
                arr[j-1] = temp;
                j--;
            }
    }
    Print(arr);
}
}